import { useState, useMemo, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './components/AuthPage'
import { InputForm } from './components/InputForm'
import { Dashboard } from './components/Dashboard'
import { DataTable } from './components/DataTable'
import { ExpensesTable } from './components/ExpensesTable'
import { MortgageAmortizationTable } from './components/MortgageAmortizationTable'
import SavingsAccountsTable from './components/SavingsAccountsTable'
import { calculateRetirementProjection, generateMortgageAmortizationSchedule, defaultInputs, calculateAge } from './utils/calculations'
import { assetAPI } from './api/assetClient'
import { personClient } from './api/personClient'
import { incomeAPI } from './api/incomeClient'
import { savingsAccountAPI } from './api/savingsAccountClient'
import { expensesClient } from './api/expensesClient'
import { economicAssumptionsClient } from './api/economicAssumptionsClient'
import { taxConfigurationClient } from './api/taxConfigurationClient'
import './App.css'

function AppContent() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const [inputs, setInputs] = useState(defaultInputs)
  const [persons, setPersons] = useState([])
  const [incomeSources, setIncomeSources] = useState([])
  const [savingsAccounts, setSavingsAccounts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [economicAssumptions, setEconomicAssumptions] = useState({})
  const [taxConfiguration, setTaxConfiguration] = useState({})
  const [activeView, setActiveView] = useState('personal')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Helper function to extract home asset data and merge into inputs
  const mergeAssetDataIntoInputs = (baseInputs, assets) => {
    if (!assets || assets.length === 0) {
      return baseInputs;
    }

    const homeAsset = assets.find(asset => asset.assetType === 'primary-residence');

    // Calculate total value of non-home assets
    let otherAssetsTotal = 0;
    for (const asset of assets) {
      if (asset.assetType !== 'primary-residence') {
        const assetValue = parseFloat(asset.currentValue) || 0;
        otherAssetsTotal += assetValue;
      }
    }

    // Build merged inputs
    const mergedInputs = {
      ...baseInputs,
      allAssets: assets,
    };

    // Merge home asset data if it exists
    if (homeAsset) {
      mergedInputs.homeValue = homeAsset.currentValue || baseInputs.homeValue;
      mergedInputs.homeMortgage = homeAsset.loanBalance || baseInputs.homeMortgage;
      mergedInputs.homeMortgageRate = homeAsset.loanRate || baseInputs.homeMortgageRate;
      mergedInputs.homeMortgageMonthlyPayment = homeAsset.monthlyPayment || baseInputs.homeMortgageMonthlyPayment;
      mergedInputs.homeMortgagePayoffYear = homeAsset.payoffYear || baseInputs.homeMortgagePayoffYear;
      mergedInputs.homeMortgagePayoffMonth = homeAsset.payoffMonth || baseInputs.homeMortgagePayoffMonth;
      mergedInputs.homePropertyTax = homeAsset.propertyTax || baseInputs.homePropertyTax;
      mergedInputs.homePropertyTaxAnnualIncrease = homeAsset.propertyTaxAnnualIncrease || baseInputs.homePropertyTaxAnnualIncrease;
      mergedInputs.homeInsurance = homeAsset.insurance || baseInputs.homeInsurance;
      mergedInputs.homeInsuranceAnnualIncrease = homeAsset.insuranceAnnualIncrease || baseInputs.homeInsuranceAnnualIncrease;
      mergedInputs.homeSalePlanEnabled = homeAsset.sellPlanEnabled || baseInputs.homeSalePlanEnabled;
      mergedInputs.homeSaleYear = homeAsset.sellYear || baseInputs.homeSaleYear;
      mergedInputs.homeSaleMonth = homeAsset.sellMonth || baseInputs.homeSaleMonth;
      mergedInputs.homeMortgageExtraPrincipalPayment = homeAsset.extraPrincipalPayment || baseInputs.homeMortgageExtraPrincipalPayment;
    }

    // Always override otherAssets with calculated total (including 0 if no other assets exist)
    mergedInputs.otherAssets = otherAssetsTotal;

    return mergedInputs;
  };

  // Helper function to extract person data and merge into inputs
  const mergePersonDataIntoInputs = (baseInputs) => {
    // This will be called after persons are loaded in InputForm
    // For now, we'll need to ensure persons are loaded in App and merged here
    return baseInputs;
  };

  // Load user's data from individual tables (not from financial_data)
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      setIsLoadingData(true)
      try {
        // Load all individual data tables
        let personsList = [];
        try {
          personsList = await personClient.getPersons();
          console.log('Persons loaded:', personsList);
        } catch (personError) {
          console.log('Could not load persons:', personError.message);
        }

        // Migrate home data from financial_data to assets table if needed
        try {
          const migrationResult = await assetAPI.migrateHomeData();
          console.log('Home data migration result:', migrationResult);
        } catch (migrationError) {
          console.log('Home data migration skipped or already migrated:', migrationError.message);
        }

        // Migrate person ownership - assign unassigned assets/accounts to 'Self' person
        try {
          const ownershipResult = await assetAPI.migratePersonOwnership();
          console.log('Person ownership migration result:', ownershipResult);
        } catch (ownershipError) {
          console.log('Person ownership migration skipped:', ownershipError.message);
        }

        let incomeSourcesList = [];
        try {
          incomeSourcesList = await incomeAPI.getSources();
          console.log('Income sources loaded:', incomeSourcesList);
        } catch (incomeError) {
          console.log('Could not load income sources:', incomeError.message);
        }

        let savingsAccountsList = [];
        try {
          savingsAccountsList = await savingsAccountAPI.getAccounts();
          console.log('Savings accounts loaded:', savingsAccountsList);
        } catch (savingsError) {
          console.log('Could not load savings accounts:', savingsError.message);
        }

        let expensesList = [];
        try {
          expensesList = await expensesClient.getExpenses();
          console.log('Expenses loaded:', expensesList);
        } catch (expensesError) {
          console.log('Could not load expenses:', expensesError.message);
        }

        let assets = [];
        try {
          assets = await assetAPI.getAssets();
        } catch (assetError) {
          console.log('Could not load assets:', assetError.message);
        }

        let economicAssumptionsData = {};
        try {
          economicAssumptionsData = await economicAssumptionsClient.getAssumptions();
          console.log('Economic assumptions loaded:', economicAssumptionsData);
        } catch (economicError) {
          console.log('Could not load economic assumptions:', economicError.message);
        }

        let taxConfigurationData = {};
        try {
          taxConfigurationData = await taxConfigurationClient.getConfiguration();
          console.log('Tax configuration loaded:', taxConfigurationData);
        } catch (taxError) {
          console.log('Could not load tax configuration:', taxError.message);
        }

        // Build inputs from individual data tables (not from financial_data)
        const primaryPerson = personsList.find(p => p.personType === 'self' || p.personType === 'primary');
        const calculatedAge = primaryPerson ? calculateAge(primaryPerson.birthMonth, primaryPerson.birthYear) : 0;

        const baseInputs = {
          // From persons table
          maritalStatus: personsList.length > 1 ? 'married' : 'single',
          currentAge: calculatedAge,
          birthMonth: primaryPerson?.birthMonth || null,
          birthYear: primaryPerson?.birthYear || null,
          retirementAge: primaryPerson?.retirementAge || 65,
          deathAge: primaryPerson?.deathAge || 95,
          contributionStopAge: primaryPerson?.contributionStopAge || primaryPerson?.retirementAge || 65,
          currentSalary: primaryPerson?.currentSalary || 0,
          annualSalaryIncrease: primaryPerson?.annualSalaryIncrease || 0,
          traditionalIRA: primaryPerson?.traditionalIRA || 0,
          rothIRA: primaryPerson?.rothIRA || 0,
          investmentAccounts: primaryPerson?.investmentAccounts || 0,
          traditionalIRAContribution: primaryPerson?.traditionalIRAContribution || 0,
          traditionIRACompanyMatch: primaryPerson?.traditionIRACompanyMatch || 0,
          rothIRAContribution: primaryPerson?.rothIRAContribution || 0,
          rothIRACompanyMatch: primaryPerson?.rothIRACompanyMatch || 0,
          investmentAccountsContribution: primaryPerson?.investmentAccountsContribution || 0,

          // From assets table - home data
          homeValue: null,
          homeMortgage: null,
          homeMortgageRate: null,
          homeMortgageMonthlyPayment: null,
          homeMortgagePayoffYear: null,
          homeMortgagePayoffMonth: null,
          homePropertyTaxInsurance: null,
          homePropertyTax: null,
          homePropertyTaxAnnualIncrease: null,
          homeInsurance: null,
          homeInsuranceAnnualIncrease: null,
          homeSalePlanEnabled: null,
          homeSaleYear: null,
          homeSaleMonth: null,
          homeMortgageExtraPrincipalPayment: null,
          otherAssets: 0,

          // From expenses table
          preRetirementAnnualExpenses: 0,
          postRetirementAnnualExpenses: 0,

          // From economic_assumptions table
          investmentReturn: economicAssumptionsData.investmentReturn ?? 7,
          inflationRate: economicAssumptionsData.inflationRate ?? 3,

          // From tax_configuration table
          federalTaxRate: taxConfigurationData.federalTaxRate ?? 22,
          stateTaxRate: taxConfigurationData.stateTaxRate ?? 5,
          workingState: taxConfigurationData.workingState ?? 'TX',
          retirementState: taxConfigurationData.retirementState ?? null,
          stateChangeOption: taxConfigurationData.stateChangeOption ?? 'at-retirement',
          stateChangeAge: taxConfigurationData.stateChangeAge ?? null,
          filingStatus: taxConfigurationData.filingStatus ?? 'single',
          withdrawalStrategy: taxConfigurationData.withdrawalStrategy ?? 'waterfall',
        };

        // Merge asset data into inputs
        const mergedInputs = mergeAssetDataIntoInputs(baseInputs, assets);
        console.log('Loading data from individual tables - birthMonth:', mergedInputs.birthMonth, 'birthYear:', mergedInputs.birthYear, 'deathAge:', mergedInputs.deathAge);

        // Aggregate expenses from expenses table
        let preRetirementTotal = 0;
        let postRetirementTotal = 0;
        if (expensesList && expensesList.length > 0) {
          expensesList.forEach(expense => {
            if (expense.preRetirement) {
              preRetirementTotal += (expense.monthlyAmount || 0) * 12;
            }
            if (expense.postRetirement) {
              postRetirementTotal += (expense.monthlyAmount || 0) * 12;
            }
          });
        }
        mergedInputs.preRetirementAnnualExpenses = preRetirementTotal || mergedInputs.preRetirementAnnualExpenses;
        mergedInputs.postRetirementAnnualExpenses = postRetirementTotal || mergedInputs.postRetirementAnnualExpenses;

        // Set ALL state at once to ensure calculations have all data together
        setPersons(personsList);
        setIncomeSources(incomeSourcesList);
        setSavingsAccounts(savingsAccountsList);
        setExpenses(expensesList);
        setEconomicAssumptions(economicAssumptionsData);
        setTaxConfiguration(taxConfigurationData);
        setInputs(mergedInputs);
        setLastSaved(new Date())
      } catch (err) {
        console.error('Failed to load user data:', err)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadUserData()
  }, [user])

  const { projectionData, accountsBreakdown } = useMemo(() => {
    const result = calculateRetirementProjection(inputs, persons, incomeSources, savingsAccounts, expenses, economicAssumptions, taxConfiguration)
    return {
      projectionData: result.years,
      accountsBreakdown: result.accountsBreakdown || []
    }
  }, [inputs, persons, incomeSources, savingsAccounts, expenses, economicAssumptions, taxConfiguration])

  const mortgageSchedule = useMemo(() => {
    return generateMortgageAmortizationSchedule(inputs, persons)
  }, [inputs, persons])

  const reloadAssetData = async () => {
    // Reload assets and merge them into current inputs
    try {
      const assets = await assetAPI.getAssets();
      setInputs(prevInputs => mergeAssetDataIntoInputs(prevInputs, assets));
    } catch (err) {
      console.error('Failed to reload asset data:', err);
    }
  };

  const reloadSavingsAccountsData = async () => {
    // Reload savings accounts - this will trigger recalculation via useMemo
    try {
      const accounts = await savingsAccountAPI.getAccounts();
      setSavingsAccounts(accounts);
    } catch (err) {
      console.error('Failed to reload savings accounts:', err);
    }
  };

  const reloadExpensesData = async () => {
    // Reload expenses - this will trigger recalculation via useMemo
    try {
      const expensesList = await expensesClient.getExpenses();
      setExpenses(expensesList);
    } catch (err) {
      console.error('Failed to reload expenses:', err);
    }
  };

  const reloadEconomicAssumptions = async () => {
    // Reload economic assumptions - this will trigger recalculation via useMemo
    try {
      const assumptions = await economicAssumptionsClient.getAssumptions();
      setEconomicAssumptions(assumptions);
    } catch (err) {
      console.error('Failed to reload economic assumptions:', err);
    }
  };

  const reloadTaxConfiguration = async () => {
    // Reload tax configuration - this will trigger recalculation via useMemo
    try {
      const config = await taxConfigurationClient.getConfiguration();
      setTaxConfiguration(config);
    } catch (err) {
      console.error('Failed to reload tax configuration:', err);
    }
  };

  const handleInputsChange = async (newInputs) => {
    console.log('=== handleInputsChange CALLED ===');
    console.log('newInputs.birthYear:', newInputs.birthYear);
    console.log('newInputs.birthMonth:', newInputs.birthMonth);
    setInputs(newInputs)

    // Auto-save to server - save person data to persons table
    if (user && persons && persons.length > 0) {
      setIsSaving(true)
      console.log('Starting auto-save to persons table...');
      try {
        const primaryPerson = persons.find(p => p.personType === 'self' || p.personType === 'primary');
        if (primaryPerson) {
          // Save person data to persons table
          const personDataToSave = {
            birthMonth: newInputs.birthMonth,
            birthYear: newInputs.birthYear,
            retirementAge: newInputs.retirementAge,
            deathAge: newInputs.deathAge,
            contributionStopAge: newInputs.contributionStopAge,
            currentSalary: newInputs.currentSalary,
            annualSalaryIncrease: newInputs.annualSalaryIncrease,
            traditionalIRA: newInputs.traditionalIRA,
            rothIRA: newInputs.rothIRA,
            investmentAccounts: newInputs.investmentAccounts,
            traditionalIRAContribution: newInputs.traditionalIRAContribution,
            traditionIRACompanyMatch: newInputs.traditionIRACompanyMatch,
            rothIRAContribution: newInputs.rothIRAContribution,
            rothIRACompanyMatch: newInputs.rothIRACompanyMatch,
            investmentAccountsContribution: newInputs.investmentAccountsContribution,
          };
          console.log('Saving person data:', personDataToSave);
          await personClient.updatePerson(primaryPerson.id, personDataToSave);
        }
        setLastSaved(new Date())
      } catch (err) {
        console.error('Failed to save person data:', err)
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (authLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const navTabs = [
    { id: 'dashboard', label: '📊 Dashboard', type: 'view' },
    { id: 'table', label: '📋 Year-by-Year Data', type: 'view' },
    { id: 'expenses-breakdown', label: '💸 Expenses Breakdown', type: 'view' },
    { id: 'savings-breakdown', label: '🏦 Savings Breakdown', type: 'view' },
    { id: 'mortgage-schedule', label: '🏦 Mortgage Schedule', type: 'view' },
    { id: 'divider', label: '', type: 'divider' },
    { id: 'personal', label: '👤 Personal', type: 'form' },
    { id: 'income', label: '💼 Income', type: 'form' },
    { id: 'savings', label: '🏦 Savings', type: 'form' },
    { id: 'assets', label: '🏠 Assets', type: 'form' },
    { id: 'expenses', label: '⚙️ Expenses', type: 'form' },
    { id: 'social-security', label: '🏛️ Social Security', type: 'form' },
    { id: 'economic', label: '📈 Economic', type: 'form' },
    { id: 'taxes', label: '💰 Taxes', type: 'form' },
  ];

  const isFormTab = (tabId) => {
    return ['personal', 'income', 'savings', 'assets', 'expenses', 'social-security', 'economic', 'taxes'].includes(tabId);
  };

  const handleTabClick = (tabId) => {
    setActiveView(tabId);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>💰 Retirement Planning Visualizer</h1>
          <p className="subtitle">Plan your finances through retirement with detailed projections and analysis</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <p>Welcome, {user.firstName || user.email}</p>
            {lastSaved && <span className="last-saved">Last saved: {lastSaved.toLocaleTimeString()}</span>}
            {isSaving && <span className="saving">Saving...</span>}
          </div>
          <button className="btn-logout" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <div className="app-container">
        <nav className="sidebar-nav">
          {navTabs.map(tab => (
            tab.type === 'divider' ? (
              <div key={tab.id} className="nav-divider"></div>
            ) : (
              <button
                key={tab.id}
                className={`nav-tab ${activeView === tab.id || (isFormTab(tab.id) && activeView === 'form') ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}
              </button>
            )
          ))}
        </nav>

        <div className="main-content">
          {isLoadingData ? (
            <div className="loading-spinner">Loading your data...</div>
          ) : (
            <>
              {activeView === 'dashboard' && <Dashboard data={projectionData} />}
              {activeView === 'table' && <DataTable data={projectionData} />}
              {activeView === 'expenses-breakdown' && <ExpensesTable data={projectionData} />}
              {activeView === 'savings-breakdown' && <SavingsAccountsTable accountsBreakdown={accountsBreakdown} />}
              {activeView === 'mortgage-schedule' && <MortgageAmortizationTable schedule={mortgageSchedule} />}
              {isFormTab(activeView) && (
                <InputForm inputs={inputs} onInputsChange={handleInputsChange} activeTab={activeView} onAssetsSaved={reloadAssetData} onSavingsAccountsSaved={reloadSavingsAccountsData} onExpensesSaved={reloadExpensesData} onEconomicAssumptionsSaved={reloadEconomicAssumptions} onTaxConfigurationSaved={reloadTaxConfiguration} economicAssumptions={economicAssumptions} taxConfiguration={taxConfiguration} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

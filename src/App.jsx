import { useState, useMemo, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './components/AuthPage'
import { InputForm } from './components/InputForm'
import { Dashboard } from './components/Dashboard'
import { DataTable } from './components/DataTable'
import { ExpensesTable } from './components/ExpensesTable'
import { MortgageAmortizationTable } from './components/MortgageAmortizationTable'
import { calculateRetirementProjection, generateMortgageAmortizationSchedule, defaultInputs, calculateAge } from './utils/calculations'
import { financialAPI } from './api/client'
import { assetAPI } from './api/assetClient'
import { personClient } from './api/personClient'
import { incomeAPI } from './api/incomeClient'
import { savingsAccountAPI } from './api/savingsAccountClient'
import { expensesClient } from './api/expensesClient'
import './App.css'

function AppContent() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const [inputs, setInputs] = useState(defaultInputs)
  const [persons, setPersons] = useState([])
  const [incomeSources, setIncomeSources] = useState([])
  const [savingsAccounts, setSavingsAccounts] = useState([])
  const [expenses, setExpenses] = useState([])
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

  // Load user's financial data on mount
  useEffect(() => {
    const loadFinancialData = async () => {
      if (!user) return

      setIsLoadingData(true)
      try {
        const data = await financialAPI.getFinancialData()
        console.log('App.jsx - Financial data loaded from API:', { birthMonth: data?.birthMonth, birthYear: data?.birthYear, data });
        if (data) {
          const calculatedAge = calculateAge(data.birthMonth, data.birthYear);

          // Create base inputs from financial data (person demographic data comes from persons table)
          const baseInputs = {
            maritalStatus: data.maritalStatus || 'single',
            currentAge: calculatedAge,
            birthMonth: data.birthMonth,
            birthYear: data.birthYear,
            retirementAge: data.retirementAge || 65,
            deathAge: data.deathAge || 95,
            contributionStopAge: data.contributionStopAge || 65,
            currentSalary: data.currentSalary || 100000,
            annualSalaryIncrease: data.annualSalaryIncrease || 3,
            traditionalIRA: data.traditionalIRA || 50000,
            rothIRA: data.rothIRA || 25000,
            investmentAccounts: data.investmentAccounts || 100000,
            traditionalIRAContribution: data.traditionalIRAContribution || 10000,
            traditionIRACompanyMatch: data.traditionIRACompanyMatch || 5000,
            rothIRAContribution: data.rothIRAContribution || 5000,
            rothIRACompanyMatch: data.rothIRACompanyMatch || 0,
            investmentAccountsContribution: data.investmentAccountsContribution || 5000,
            homeValue: data.homeValue,
            homeMortgage: data.homeMortgage,
            homeMortgageRate: data.homeMortgageRate,
            homeMortgageMonthlyPayment: data.homeMortgageMonthlyPayment,
            homeMortgagePayoffYear: data.homeMortgagePayoffYear,
            homeMortgagePayoffMonth: data.homeMortgagePayoffMonth,
            homePropertyTaxInsurance: data.homePropertyTaxInsurance,
            homePropertyTax: data.homePropertyTax,
            homePropertyTaxAnnualIncrease: data.homePropertyTaxAnnualIncrease,
            homeInsurance: data.homeInsurance,
            homeInsuranceAnnualIncrease: data.homeInsuranceAnnualIncrease,
            homeSalePlanEnabled: data.homeSalePlanEnabled,
            homeSaleYear: data.homeSaleYear,
            homeSaleMonth: data.homeSaleMonth,
            homeMortgageExtraPrincipalPayment: data.homeMortgageExtraPrincipalPayment,
            otherAssets: data.otherAssets || 50000,
            preRetirementAnnualExpenses: data.preRetirementAnnualExpenses || 60000,
            postRetirementAnnualExpenses: data.postRetirementAnnualExpenses || 45000,
            investmentReturn: data.investmentReturn || 7,
            inflationRate: data.inflationRate || 3,
            federalTaxRate: data.federalTaxRate || 22,
            stateTaxRate: data.stateTaxRate || 5,
            workingState: data.workingState || 'TX',
            retirementState: data.retirementState || null,
            stateChangeOption: data.stateChangeOption || 'at-retirement',
            stateChangeAge: data.stateChangeAge || null,
            filingStatus: data.filingStatus || 'single',
            withdrawalStrategy: data.withdrawalStrategy || 'waterfall',
          };

          // Load persons data first (before setting inputs)
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

          // Load income sources
          let incomeSourcesList = [];
          try {
            incomeSourcesList = await incomeAPI.getSources();
            console.log('Income sources loaded:', incomeSourcesList);
          } catch (incomeError) {
            console.log('Could not load income sources:', incomeError.message);
          }

          // Load savings accounts
          let savingsAccountsList = [];
          try {
            savingsAccountsList = await savingsAccountAPI.getAccounts();
            console.log('Savings accounts loaded:', savingsAccountsList);
          } catch (savingsError) {
            console.log('Could not load savings accounts:', savingsError.message);
          }

          // Load expenses
          let expensesList = [];
          try {
            expensesList = await expensesClient.getExpenses();
            console.log('Expenses loaded:', expensesList);
          } catch (expensesError) {
            console.log('Could not load expenses:', expensesError.message);
          }

          // Load assets
          let assets = [];
          try {
            assets = await assetAPI.getAssets();
          } catch (assetError) {
            console.log('Could not load assets:', assetError.message);
          }

          // Merge asset data into inputs
          const mergedInputs = mergeAssetDataIntoInputs(baseInputs, assets);
          console.log('Loading data from DB - birthMonth:', mergedInputs.birthMonth, 'birthYear:', mergedInputs.birthYear, 'deathAge:', mergedInputs.deathAge);

          // Set ALL state at once to ensure calculations have all data together
          setPersons(personsList);
          setIncomeSources(incomeSourcesList);
          setSavingsAccounts(savingsAccountsList);
          setExpenses(expensesList);
          setInputs(mergedInputs);
          setLastSaved(new Date(data.updatedAt))
        }
      } catch (err) {
        console.error('Failed to load financial data:', err)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadFinancialData()
  }, [user])

  const projectionData = useMemo(() => {
    return calculateRetirementProjection(inputs, persons, incomeSources, savingsAccounts, expenses)
  }, [inputs, persons, incomeSources, savingsAccounts, expenses])

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

  const handleInputsChange = async (newInputs) => {
    console.log('=== handleInputsChange CALLED ===');
    console.log('newInputs.birthYear:', newInputs.birthYear);
    console.log('newInputs.birthMonth:', newInputs.birthMonth);
    setInputs(newInputs)

    // Auto-save to server
    if (user) {
      setIsSaving(true)
      console.log('Starting auto-save...');
      try {
        // Only send fields that exist in the database schema
        const dataToSave = {
          maritalStatus: newInputs.maritalStatus,
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
          homeValue: newInputs.homeValue,
          homeMortgage: newInputs.homeMortgage,
          homeMortgageRate: newInputs.homeMortgageRate,
          homeMortgageMonthlyPayment: newInputs.homeMortgageMonthlyPayment,
          homeMortgagePayoffYear: newInputs.homeMortgagePayoffYear,
          homeMortgagePayoffMonth: newInputs.homeMortgagePayoffMonth,
          homePropertyTaxInsurance: newInputs.homePropertyTaxInsurance,
          homePropertyTax: newInputs.homePropertyTax,
          homePropertyTaxAnnualIncrease: newInputs.homePropertyTaxAnnualIncrease,
          homeInsurance: newInputs.homeInsurance,
          homeInsuranceAnnualIncrease: newInputs.homeInsuranceAnnualIncrease,
          homeSalePlanEnabled: newInputs.homeSalePlanEnabled,
          homeSaleYear: newInputs.homeSaleYear,
          homeSaleMonth: newInputs.homeSaleMonth,
          homeMortgageExtraPrincipalPayment: newInputs.homeMortgageExtraPrincipalPayment,
          otherAssets: newInputs.otherAssets,
          preRetirementAnnualExpenses: newInputs.preRetirementAnnualExpenses,
          postRetirementAnnualExpenses: newInputs.postRetirementAnnualExpenses,
          investmentReturn: newInputs.investmentReturn,
          inflationRate: newInputs.inflationRate,
          federalTaxRate: newInputs.federalTaxRate,
          stateTaxRate: newInputs.stateTaxRate,
          workingState: newInputs.workingState,
          retirementState: newInputs.retirementState,
          stateChangeOption: newInputs.stateChangeOption,
          stateChangeAge: newInputs.stateChangeAge,
          filingStatus: newInputs.filingStatus,
          withdrawalStrategy: newInputs.withdrawalStrategy,
        }
        console.log('dataToSave being sent:', { birthMonth: dataToSave.birthMonth, birthYear: dataToSave.birthYear })
        await financialAPI.saveFinancialData(dataToSave)
        setLastSaved(new Date())
      } catch (err) {
        console.error('Failed to save data:', err)
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
              {activeView === 'mortgage-schedule' && <MortgageAmortizationTable schedule={mortgageSchedule} />}
              {isFormTab(activeView) && (
                <InputForm inputs={inputs} onInputsChange={handleInputsChange} activeTab={activeView} onAssetsSaved={reloadAssetData} onSavingsAccountsSaved={reloadSavingsAccountsData} onExpensesSaved={reloadExpensesData} />
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

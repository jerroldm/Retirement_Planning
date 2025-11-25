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
import './App.css'

function AppContent() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const [inputs, setInputs] = useState(defaultInputs)
  const [persons, setPersons] = useState([])
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
    if (!homeAsset) {
      return baseInputs;
    }

    // Merge home asset data into inputs, preferring asset values when available
    return {
      ...baseInputs,
      homeValue: homeAsset.currentValue || baseInputs.homeValue,
      homeMortgage: homeAsset.loanBalance || baseInputs.homeMortgage,
      homeMortgageRate: homeAsset.loanRate || baseInputs.homeMortgageRate,
      homeMortgageMonthlyPayment: homeAsset.monthlyPayment || baseInputs.homeMortgageMonthlyPayment,
      homeMortgagePayoffYear: homeAsset.payoffYear || baseInputs.homeMortgagePayoffYear,
      homeMortgagePayoffMonth: homeAsset.payoffMonth || baseInputs.homeMortgagePayoffMonth,
      homePropertyTax: homeAsset.propertyTax || baseInputs.homePropertyTax,
      homePropertyTaxAnnualIncrease: homeAsset.propertyTaxAnnualIncrease || baseInputs.homePropertyTaxAnnualIncrease,
      homeInsurance: homeAsset.insurance || baseInputs.homeInsurance,
      homeInsuranceAnnualIncrease: homeAsset.insuranceAnnualIncrease || baseInputs.homeInsuranceAnnualIncrease,
      homeSalePlanEnabled: homeAsset.sellPlanEnabled || baseInputs.homeSalePlanEnabled,
      homeSaleYear: homeAsset.sellYear || baseInputs.homeSaleYear,
      homeSaleMonth: homeAsset.sellMonth || baseInputs.homeSaleMonth,
      homeMortgageExtraPrincipalPayment: homeAsset.extraPrincipalPayment || baseInputs.homeMortgageExtraPrincipalPayment,
      allAssets: assets,
    };
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

          // Set persons first (before setting inputs) so calculations have all data
          setPersons(personsList);

          // Try to load and merge assets if available
          try {
            const assets = await assetAPI.getAssets();
            const mergedInputs = mergeAssetDataIntoInputs(baseInputs, assets);
            console.log('Loading data from DB with merged assets - birthMonth:', mergedInputs.birthMonth, 'birthYear:', mergedInputs.birthYear);
            setInputs(mergedInputs);
          } catch (assetError) {
            console.log('Could not load assets, using financial data:', assetError.message);
            console.log('Loading baseInputs - birthMonth:', baseInputs.birthMonth, 'birthYear:', baseInputs.birthYear);
            setInputs(baseInputs);
          }


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
    return calculateRetirementProjection(inputs, persons)
  }, [inputs, persons])

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
    { id: 'economic', label: '📈 Economic', type: 'form' },
    { id: 'taxes', label: '💰 Taxes', type: 'form' },
  ];

  const isFormTab = (tabId) => {
    return ['personal', 'income', 'savings', 'assets', 'expenses', 'economic', 'taxes'].includes(tabId);
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
                <InputForm inputs={inputs} onInputsChange={handleInputsChange} activeTab={activeView} onAssetsSaved={reloadAssetData} />
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

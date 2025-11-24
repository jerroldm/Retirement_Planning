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
import './App.css'

function AppContent() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const [inputs, setInputs] = useState(defaultInputs)
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
    };
  };

  // Load user's financial data on mount
  useEffect(() => {
    const loadFinancialData = async () => {
      if (!user) return

      setIsLoadingData(true)
      try {
        const data = await financialAPI.getFinancialData()
        if (data) {
          const calculatedAge = calculateAge(data.birthMonth, data.birthYear);
          const calculatedSpouse2Age = calculateAge(data.spouse2BirthMonth, data.spouse2BirthYear);

          // Create base inputs from financial data
          const baseInputs = {
            maritalStatus: data.maritalStatus || 'single',
            currentAge: calculatedAge,
            birthMonth: data.birthMonth,
            birthYear: data.birthYear,
            retirementAge: data.retirementAge,
            deathAge: data.deathAge,
            contributionStopAge: data.contributionStopAge,
            currentSalary: data.currentSalary,
            annualSalaryIncrease: data.annualSalaryIncrease,
            traditionalIRA: data.traditionalIRA,
            rothIRA: data.rothIRA,
            investmentAccounts: data.investmentAccounts,
            traditionalIRAContribution: data.traditionalIRAContribution,
            traditionIRACompanyMatch: data.traditionIRACompanyMatch,
            rothIRAContribution: data.rothIRAContribution,
            rothIRACompanyMatch: data.rothIRACompanyMatch,
            investmentAccountsContribution: data.investmentAccountsContribution,
            spouse2CurrentAge: calculatedSpouse2Age,
            spouse2BirthMonth: data.spouse2BirthMonth,
            spouse2BirthYear: data.spouse2BirthYear,
            spouse2RetirementAge: data.spouse2RetirementAge,
            spouse2CurrentSalary: data.spouse2CurrentSalary,
            spouse2AnnualSalaryIncrease: data.spouse2AnnualSalaryIncrease,
            spouse2TraditionalIRA: data.spouse2TraditionalIRA,
            spouse2RothIRA: data.spouse2RothIRA,
            spouse2InvestmentAccounts: data.spouse2InvestmentAccounts,
            spouse2TraditionalIRAContribution: data.spouse2TraditionalIRAContribution,
            spouse2TraditionalIRACompanyMatch: data.spouse2TraditionalIRACompanyMatch,
            spouse2RothIRAContribution: data.spouse2RothIRAContribution,
            spouse2RothIRACompanyMatch: data.spouse2RothIRACompanyMatch,
            spouse2InvestmentAccountsContribution: data.spouse2InvestmentAccountsContribution,
            spouse2ContributionStopAge: data.spouse2ContributionStopAge,
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
            otherAssets: data.otherAssets,
            preRetirementAnnualExpenses: data.preRetirementAnnualExpenses,
            postRetirementAnnualExpenses: data.postRetirementAnnualExpenses,
            investmentReturn: data.investmentReturn,
            inflationRate: data.inflationRate,
            federalTaxRate: data.federalTaxRate,
            stateTaxRate: data.stateTaxRate,
          };

          // Try to load and merge assets if available
          try {
            const assets = await assetAPI.getAssets();
            const mergedInputs = mergeAssetDataIntoInputs(baseInputs, assets);
            setInputs(mergedInputs);
          } catch (assetError) {
            console.log('Could not load assets, using financial data:', assetError.message);
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
    return calculateRetirementProjection(inputs)
  }, [inputs])

  const mortgageSchedule = useMemo(() => {
    return generateMortgageAmortizationSchedule(inputs)
  }, [inputs])

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
    setInputs(newInputs)

    // Auto-save to server
    if (user) {
      setIsSaving(true)
      try {
        await financialAPI.saveFinancialData(newInputs)
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
          {activeView === 'dashboard' && <Dashboard data={projectionData} />}
          {activeView === 'table' && <DataTable data={projectionData} />}
          {activeView === 'expenses-breakdown' && <ExpensesTable data={projectionData} />}
          {activeView === 'mortgage-schedule' && <MortgageAmortizationTable schedule={mortgageSchedule} />}
          {isFormTab(activeView) && (
            <>
              {isLoadingData ? (
                <div className="loading-spinner">Loading your data...</div>
              ) : (
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

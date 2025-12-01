import React, { useState, useEffect } from 'react';
import { defaultInputs, calculateAge } from '../utils/calculations';
import { AssetList } from './AssetList';
import { AssetTypeSelector } from './AssetTypeSelector';
import { AssetForm } from './AssetForm';
import { assetAPI } from '../api/assetClient';
import { SavingsAccountList } from './SavingsAccountList';
import { SavingsAccountTypeSelector } from './SavingsAccountTypeSelector';
import { SavingsAccountForm } from './SavingsAccountForm';
import { savingsAccountAPI } from '../api/savingsAccountClient';
import { PersonList } from './PersonList';
import PersonTypeSelector from './PersonTypeSelector';
import PersonForm from './PersonForm';
import { personClient } from '../api/personClient';
import { IncomeList } from './IncomeList';
import { IncomeForm } from './IncomeForm';
import { incomeAPI } from '../api/incomeClient';
import { ExpensesList } from './ExpensesList';
import { ExpensesForm } from './ExpensesForm';
import { expensesClient } from '../api/expensesClient';
import { SocialSecurityList } from './SocialSecurityList';
import { SocialSecurityForm } from './SocialSecurityForm';
import { socialSecurityClient } from '../api/socialSecurityClient';
import { stateList } from '../config/stateTaxConfig.js';
import { getStandardDeduction } from '../utils/taxCalculations.js';
import './InputForm.css';

export const InputForm = ({ onInputsChange, inputs, activeTab, onAssetsSaved, onSavingsAccountsSaved, onExpensesSaved }) => {
  const [formData, setFormData] = useState(inputs || defaultInputs);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [showAssetTypeSelector, setShowAssetTypeSelector] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);

  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [savingsAccountsLoading, setSavingsAccountsLoading] = useState(false);
  const [showAccountTypeSelector, setShowAccountTypeSelector] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  const [persons, setPersons] = useState([]);
  const [personsLoading, setPersonsLoading] = useState(false);
  const [showPersonTypeSelector, setShowPersonTypeSelector] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [selectedPersonType, setSelectedPersonType] = useState(null);
  const [editingPerson, setEditingPerson] = useState(null);

  const [incomeSources, setIncomeSources] = useState([]);
  const [incomeSourcesLoading, setIncomeSourcesLoading] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingIncomeSource, setEditingIncomeSource] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showExpensesForm, setShowExpensesForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [socialSecurityRecords, setSocialSecurityRecords] = useState([]);
  const [socialSecurityLoading, setSocialSecurityLoading] = useState(false);
  const [showSocialSecurityForm, setShowSocialSecurityForm] = useState(false);
  const [editingSocialSecurity, setEditingSocialSecurity] = useState(null);

  // Load assets, savings accounts, persons, income sources, expenses, and social security when component mounts
  useEffect(() => {
    loadAssets();
    loadSavingsAccounts();
    loadPersons();
    loadIncomeSources();
    loadExpenses();
    loadSocialSecurityRecords();
  }, []);

  const loadSavingsAccounts = async () => {
    try {
      setSavingsAccountsLoading(true);
      const loadedAccounts = await savingsAccountAPI.getAccounts();
      setSavingsAccounts(loadedAccounts);
    } catch (error) {
      console.error('Failed to load savings accounts:', error);
    } finally {
      setSavingsAccountsLoading(false);
    }
  };

  const loadPersons = async () => {
    try {
      setPersonsLoading(true);
      const loadedPersons = await personClient.getPersons();
      setPersons(loadedPersons);
    } catch (error) {
      console.error('Failed to load persons:', error);
    } finally {
      setPersonsLoading(false);
    }
  };

  const loadIncomeSources = async () => {
    try {
      setIncomeSourcesLoading(true);
      const loadedSources = await incomeAPI.getSources();
      setIncomeSources(loadedSources);
    } catch (error) {
      console.error('Failed to load income sources:', error);
    } finally {
      setIncomeSourcesLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      setExpensesLoading(true);
      const loadedExpenses = await expensesClient.getExpenses();
      setExpenses(loadedExpenses);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setExpensesLoading(false);
    }
  };

  const loadSocialSecurityRecords = async () => {
    try {
      setSocialSecurityLoading(true);
      const loadedRecords = await socialSecurityClient.getRecords();
      setSocialSecurityRecords(loadedRecords);
    } catch (error) {
      console.error('Failed to load social security records:', error);
    } finally {
      setSocialSecurityLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      setAssetsLoading(true);
      const loadedAssets = await assetAPI.getAssets();
      setAssets(loadedAssets);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setAssetsLoading(false);
    }
  };

  // Sync formData when inputs prop changes (e.g., after loading from database)
  useEffect(() => {
    console.log('InputForm syncing formData, inputs:', { birthMonth: inputs?.birthMonth, birthYear: inputs?.birthYear });
    setFormData(inputs || defaultInputs);
  }, [inputs]);

  // NOTE: Person syncing is disabled because birth data is stored in financial_data table and already synced via inputs prop.
  // The persons table is not being used for primary financial calculations at this time.
  // Persons are loaded for the UI (PersonList display), but data sync is intentionally skipped
  // to avoid overwriting the correctly-loaded financial_data values.
  useEffect(() => {
    // Just load persons for display in PersonList, no data sync
    // (data syncing removed to prevent overwriting financial_data)
  }, [persons]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) : value;
    const updatedData = { ...formData, [name]: newValue };

    // Auto-calculate age for Person 1
    if (name === 'birthMonth' || name === 'birthYear') {
      updatedData.currentAge = calculateAge(updatedData.birthMonth, updatedData.birthYear);
    }

    // Auto-calculate age for Spouse 2
    if (name === 'spouse2BirthMonth' || name === 'spouse2BirthYear') {
      updatedData.spouse2CurrentAge = calculateAge(updatedData.spouse2BirthMonth, updatedData.spouse2BirthYear);
    }

    setFormData(updatedData);
    onInputsChange(updatedData);
  };

  const handleReset = () => {
    setFormData(defaultInputs);
    onInputsChange(defaultInputs);
  };

  // Asset management handlers
  const handleAddAssetClick = () => {
    setEditingAsset(null);
    setShowAssetTypeSelector(true);
  };

  const handleTypeSelect = (assetType) => {
    setSelectedAssetType(assetType);
    setShowAssetTypeSelector(false);
    setShowAssetForm(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setSelectedAssetType(asset.assetType);
    setShowAssetForm(true);
  };

  const handleAssetFormSubmit = async (submittedData) => {
    try {
      if (editingAsset) {
        await assetAPI.updateAsset(editingAsset.id, submittedData);
      } else {
        await assetAPI.createAsset(submittedData);
      }
      await loadAssets();

      // Notify parent (App.jsx) that assets have been saved so calculations can be updated
      if (onAssetsSaved) {
        await onAssetsSaved();
      }

      setShowAssetForm(false);
      setEditingAsset(null);
      setSelectedAssetType(null);
    } catch (error) {
      console.error('Failed to save asset:', error);
      alert('Failed to save asset. Please try again.');
    }
  };

  const handleDeleteAsset = async (id) => {
    try {
      await assetAPI.deleteAsset(id);
      await loadAssets();

      // Notify parent (App.jsx) that assets have been updated so calculations can be refreshed
      if (onAssetsSaved) {
        await onAssetsSaved();
      }
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset. Please try again.');
    }
  };

  const handleCloseAssetForm = () => {
    setShowAssetForm(false);
    setEditingAsset(null);
    setSelectedAssetType(null);
  };

  // Savings Account handlers
  const handleAddAccountClick = () => {
    setEditingAccount(null);
    setShowAccountTypeSelector(true);
  };

  const handleAccountTypeSelect = (accountType) => {
    setSelectedAccountType(accountType);
    setShowAccountTypeSelector(false);
    setShowAccountForm(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setSelectedAccountType(account.accountType);
    setShowAccountForm(true);
  };

  const handleAccountFormSubmit = async (submittedData) => {
    try {
      console.log('handleAccountFormSubmit called with data:', submittedData);
      console.log('editingAccount:', editingAccount);
      console.log('Account ID in submittedData:', submittedData.id);

      // Use ID from submittedData (passed from form) rather than editingAccount state
      if (submittedData.id) {
        const accountId = submittedData.id;
        // Remove ID from data sent to body (it's already in the URL)
        const { id, ...dataWithoutId } = submittedData;
        console.log('Calling updateAccount with ID:', accountId, 'and data:', dataWithoutId);
        const updateResult = await savingsAccountAPI.updateAccount(accountId, dataWithoutId);
        console.log('updateAccount result:', updateResult);
      } else {
        console.log('Calling createAccount with data:', submittedData);
        const createResult = await savingsAccountAPI.createAccount(submittedData);
        console.log('createAccount result:', createResult);
      }

      console.log('Reloading savings accounts...');
      await loadSavingsAccounts();

      if (onSavingsAccountsSaved) {
        console.log('Calling onSavingsAccountsSaved callback');
        await onSavingsAccountsSaved();
      }

      console.log('Closing form dialog');
      setShowAccountForm(false);
      setEditingAccount(null);
      setSelectedAccountType(null);
    } catch (error) {
      console.error('Failed to save account - Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert('Failed to save account. Please try again. Check console for details.');
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await savingsAccountAPI.deleteAccount(id);
      await loadSavingsAccounts();
      if (onSavingsAccountsSaved) {
        await onSavingsAccountsSaved();
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleCloseAccountForm = () => {
    setShowAccountForm(false);
    setEditingAccount(null);
    setSelectedAccountType(null);
  };

  // Person management handlers
  const handleAddPersonClick = () => {
    setEditingPerson(null);
    setShowPersonTypeSelector(true);
  };

  const handlePersonTypeSelect = (personType) => {
    setSelectedPersonType(personType);
    setShowPersonTypeSelector(false);
    setShowPersonForm(true);
  };

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setSelectedPersonType(person.personType);
    setShowPersonForm(true);
  };

  const handlePersonFormSubmit = async (submittedData) => {
    try {
      if (editingPerson) {
        await personClient.updatePerson(editingPerson.id, submittedData);
      } else {
        await personClient.createPerson(submittedData);
      }
      await loadPersons();
      setShowPersonForm(false);
      setEditingPerson(null);
      setSelectedPersonType(null);

      // After saving person data, reload persons and sync birth data to formData
      const updatedPersons = await personClient.getPersons();
      const primaryPerson = updatedPersons.find(p => p.personType === 'primary') || updatedPersons[0];

      if (primaryPerson) {
        const updatedFormData = { ...formData };
        if (primaryPerson.birthMonth !== undefined) updatedFormData.birthMonth = primaryPerson.birthMonth;
        if (primaryPerson.birthYear !== undefined) updatedFormData.birthYear = primaryPerson.birthYear;
        if (primaryPerson.retirementAge !== undefined) updatedFormData.retirementAge = primaryPerson.retirementAge;

        // Recalculate age with the new birth data
        updatedFormData.currentAge = calculateAge(updatedFormData.birthMonth, updatedFormData.birthYear);

        console.log('Person saved - syncing to formData:', {
          birthMonth: updatedFormData.birthMonth,
          birthYear: updatedFormData.birthYear,
          currentAge: updatedFormData.currentAge,
          retirementAge: updatedFormData.retirementAge
        });

        setFormData(updatedFormData);
        onInputsChange(updatedFormData);
      }
    } catch (error) {
      console.error('Failed to save person:', error);
      alert('Failed to save person. Please try again.');
    }
  };

  const handleDeletePerson = async (id) => {
    try {
      await personClient.deletePerson(id);
      await loadPersons();
    } catch (error) {
      console.error('Failed to delete person:', error);
      alert('Failed to delete person. Please try again.');
    }
  };

  const handleClosePersonForm = () => {
    setShowPersonForm(false);
    setEditingPerson(null);
    setSelectedPersonType(null);
  };

  const handleAddIncomeClick = () => {
    setEditingIncomeSource(null);
    setShowIncomeForm(true);
  };

  const handleEditIncome = (source) => {
    setEditingIncomeSource(source);
    setShowIncomeForm(true);
  };

  const handleIncomeFormSubmit = async (submittedData) => {
    try {
      if (editingIncomeSource) {
        await incomeAPI.updateSource(editingIncomeSource.id, submittedData);
      } else {
        await incomeAPI.createSource(submittedData);
      }
      await loadIncomeSources();
      setShowIncomeForm(false);
      setEditingIncomeSource(null);
    } catch (error) {
      console.error('Failed to save income source:', error);
      alert('Failed to save income source. Please try again.');
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await incomeAPI.deleteSource(id);
      await loadIncomeSources();
    } catch (error) {
      console.error('Failed to delete income source:', error);
      alert('Failed to delete income source. Please try again.');
    }
  };

  const handleCloseIncomeForm = () => {
    setShowIncomeForm(false);
    setEditingIncomeSource(null);
  };

  const handleAddExpenseClick = () => {
    setEditingExpense(null);
    setShowExpensesForm(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpensesForm(true);
  };

  const handleExpenseFormSubmit = async (submittedData) => {
    try {
      if (editingExpense) {
        console.log('Updating expense:', editingExpense.id, submittedData);
        await expensesClient.updateExpense(editingExpense.id, submittedData);
      } else {
        console.log('Creating expense:', submittedData);
        await expensesClient.createExpense(submittedData);
      }
      await loadExpenses();
      if (onExpensesSaved) {
        await onExpensesSaved();
      }
      setShowExpensesForm(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await expensesClient.deleteExpense(id);
      await loadExpenses();
      if (onExpensesSaved) {
        await onExpensesSaved();
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleCloseExpensesForm = () => {
    setShowExpensesForm(false);
    setEditingExpense(null);
  };

  const handleAddSocialSecurityClick = () => {
    setEditingSocialSecurity(null);
    setShowSocialSecurityForm(true);
  };

  const handleEditSocialSecurity = (record) => {
    setEditingSocialSecurity(record);
    setShowSocialSecurityForm(true);
  };

  const handleSocialSecurityFormSubmit = async (submittedData) => {
    try {
      if (editingSocialSecurity) {
        await socialSecurityClient.updateRecord(editingSocialSecurity.id, submittedData);
      } else {
        await socialSecurityClient.createRecord(submittedData);
      }
      await loadSocialSecurityRecords();
      setShowSocialSecurityForm(false);
      setEditingSocialSecurity(null);
    } catch (error) {
      console.error('Failed to save social security record:', error);
      alert('Failed to save social security record. Please try again.');
    }
  };

  const handleDeleteSocialSecurity = async (id) => {
    try {
      await socialSecurityClient.deleteRecord(id);
      await loadSocialSecurityRecords();
    } catch (error) {
      console.error('Failed to delete social security record:', error);
      alert('Failed to delete social security record. Please try again.');
    }
  };

  const handleCloseSocialSecurityForm = () => {
    setShowSocialSecurityForm(false);
    setEditingSocialSecurity(null);
  };

  return (
    <div className="input-form">
      <div className="form-header">
        <h2>Financial Inputs</h2>
        <button className="btn-reset" onClick={handleReset}>Reset</button>
      </div>

      <div className="form-content">
        {/* Personal Information */}
        {activeTab === 'personal' && (
          <section className="form-section">
            <PersonList
              persons={persons}
              onEdit={handleEditPerson}
              onDelete={handleDeletePerson}
              onAddPerson={handleAddPersonClick}
            />
          </section>
        )}

        {/* Person Type Selector Modal */}
        {showPersonTypeSelector && (
          <PersonTypeSelector
            onSelect={handlePersonTypeSelect}
            onCancel={() => setShowPersonTypeSelector(false)}
            existingTypes={persons.map(p => p.personType)}
          />
        )}

        {/* Person Form Modal */}
        {showPersonForm && (
          <PersonForm
            person={editingPerson}
            personType={selectedPersonType}
            onSave={handlePersonFormSubmit}
            onCancel={handleClosePersonForm}
          />
        )}

        {/* Income & Salary */}
        {activeTab === 'income' && (
          <section className="form-section">
            <IncomeList
              sources={incomeSources}
              onEdit={handleEditIncome}
              onDelete={handleDeleteIncome}
              onAddIncome={handleAddIncomeClick}
            />
          </section>
        )}

        {/* Income Form Modal */}
        {showIncomeForm && (
          <IncomeForm
            source={editingIncomeSource}
            onSave={handleIncomeFormSubmit}
            onCancel={handleCloseIncomeForm}
          />
        )}

        {/* Retirement Savings */}
        {activeTab === 'savings' && (
          <section className="form-section">
            <SavingsAccountList
              accounts={savingsAccounts}
              onEdit={handleEditAccount}
              onDelete={handleDeleteAccount}
              onAddAccount={handleAddAccountClick}
            />
          </section>
        )}

        {/* Assets */}
        {activeTab === 'assets' && (
          <section className="form-section">
            <AssetList
              assets={assets}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              isLoading={assetsLoading}
              onAddClick={handleAddAssetClick}
            />
          </section>
        )}

        {/* Expenses & Lifestyle */}
        {activeTab === 'expenses' && (
          <section className="form-section">
            <ExpensesList
              expenses={expenses}
              onEdit={handleEditExpense}
              onDelete={(expenseId) => {
                if (window.confirm('Delete this expense?')) {
                  handleDeleteExpense(expenseId);
                }
              }}
              onAddExpense={handleAddExpenseClick}
            />
            {showExpensesForm && (
              <ExpensesForm
                expense={editingExpense}
                onSave={handleExpenseFormSubmit}
                onCancel={handleCloseExpensesForm}
              />
            )}
          </section>
        )}

        {/* Social Security */}
        {activeTab === 'social-security' && (
          <section className="form-section">
            <SocialSecurityList
              records={socialSecurityRecords}
              persons={persons}
              onEdit={handleEditSocialSecurity}
              onDelete={(id) => {
                if (window.confirm('Delete this social security record?')) {
                  handleDeleteSocialSecurity(id);
                }
              }}
              onAddRecord={handleAddSocialSecurityClick}
            />
            {showSocialSecurityForm && (
              <SocialSecurityForm
                record={editingSocialSecurity}
                persons={persons}
                onSave={handleSocialSecurityFormSubmit}
                onCancel={handleCloseSocialSecurityForm}
              />
            )}
          </section>
        )}

        {/* Economic Assumptions */}
        {activeTab === 'economic' && (
          <section className="form-section">
            <h3>Economic Assumptions</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="investmentReturn">Investment Return (%)</label>
                <input
                  type="number"
                  id="investmentReturn"
                  name="investmentReturn"
                  value={formData.investmentReturn}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="inflationRate">Inflation Rate (%)</label>
                <input
                  type="number"
                  id="inflationRate"
                  name="inflationRate"
                  value={formData.inflationRate}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </section>
        )}

        {/* Tax Configuration */}
        {activeTab === 'taxes' && (
          <section className="form-section">
            <h3>Tax Configuration</h3>

            {/* Filing Status */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="filingStatus">Filing Status</label>
                <select
                  id="filingStatus"
                  name="filingStatus"
                  value={formData.filingStatus || 'single'}
                  onChange={handleChange}
                >
                  <option value="single">Single</option>
                  <option value="married-joint">Married Filing Jointly</option>
                  <option value="married-separate">Married Filing Separately</option>
                  <option value="head-of-household">Head of Household</option>
                </select>
              </div>
            </div>

            {/* State Configuration */}
            <h4>State Tax Configuration</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="workingState">Working State (Current/Pre-Retirement)*</label>
                <select
                  id="workingState"
                  name="workingState"
                  value={formData.workingState || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select State --</option>
                  {stateList.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="retirementState">Retirement State (Optional)</label>
                <select
                  id="retirementState"
                  name="retirementState"
                  value={formData.retirementState || ''}
                  onChange={handleChange}
                >
                  <option value="">-- No state change --</option>
                  {stateList.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <small>Select a different state if you plan to relocate upon retirement</small>
              </div>
            </div>

            {/* State Change Timing - only show if retirementState is selected */}
            {formData.retirementState && (
              <>
                <h4>When to change states?</h4>
                <div className="form-group">
                  <label>
                    <input
                      type="radio"
                      name="stateChangeOption"
                      value="at-retirement"
                      checked={(formData.stateChangeOption || 'at-retirement') === 'at-retirement'}
                      onChange={handleChange}
                    />
                    At retirement age ({formData.retirementAge || 65})
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="stateChangeOption"
                      value="at-age"
                      checked={formData.stateChangeOption === 'at-age'}
                      onChange={handleChange}
                    />
                    At specific age
                  </label>
                </div>

                {formData.stateChangeOption === 'at-age' && (
                  <div className="form-group">
                    <label htmlFor="stateChangeAge">Age to move to {stateList.find(s => s.code === formData.retirementState)?.name || 'retirement state'}</label>
                    <input
                      type="number"
                      id="stateChangeAge"
                      name="stateChangeAge"
                      value={formData.stateChangeAge || ''}
                      onChange={handleChange}
                      min={formData.currentAge}
                      max={formData.deathAge}
                    />
                  </div>
                )}
              </>
            )}

            {/* Withdrawal Strategy */}
            <h4>Retirement Account Withdrawal Strategy</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="withdrawalStrategy">Withdrawal Strategy</label>
                <select
                  id="withdrawalStrategy"
                  name="withdrawalStrategy"
                  value={formData.withdrawalStrategy || 'waterfall'}
                  onChange={handleChange}
                >
                  <option value="waterfall">Waterfall (Simple Tax-Efficient)</option>
                  <option value="tax-bracket-fill">Tax Bracket Fill (Optimized)</option>
                </select>
                <small>
                  {formData.withdrawalStrategy === 'waterfall'
                    ? 'Draws from investment accounts first, then Traditional IRA, then Roth IRA'
                    : 'Fills available tax brackets with Traditional IRA first to minimize tax rate'}
                </small>
              </div>
            </div>

            {/* Information Section */}
            <div className="info-section">
              <p><strong>Federal Tax Brackets:</strong> 2025 IRS progressive rates (10%, 12%, 22%, 24%, 32%, 35%, 37%)</p>
              <p><strong>Standard Deduction:</strong> ${getStandardDeduction(formData.filingStatus || 'single').toLocaleString()}</p>
              {formData.workingState && (
                <p><strong>Working State Tax:</strong> {stateList.find(s => s.code === formData.workingState)?.name || formData.workingState}</p>
              )}
              {formData.retirementState && (
                <p><strong>Retirement State Tax:</strong> {stateList.find(s => s.code === formData.retirementState)?.name || formData.retirementState}</p>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Asset Type Selector Modal */}
      {showAssetTypeSelector && (
        <AssetTypeSelector
          onSelect={handleTypeSelect}
          onCancel={() => setShowAssetTypeSelector(false)}
        />
      )}

      {/* Asset Form Modal */}
      {showAssetForm && selectedAssetType && (
        <AssetForm
          assetType={selectedAssetType}
          initialData={editingAsset}
          onSubmit={handleAssetFormSubmit}
          onCancel={handleCloseAssetForm}
          persons={persons}
        />
      )}

      {/* Savings Account Type Selector Modal */}
      {showAccountTypeSelector && (
        <SavingsAccountTypeSelector
          onTypeSelect={handleAccountTypeSelect}
          onCancel={() => setShowAccountTypeSelector(false)}
        />
      )}

      {/* Savings Account Form Modal */}
      {showAccountForm && selectedAccountType && (
        <SavingsAccountForm
          accountType={selectedAccountType}
          editingAccount={editingAccount}
          onSubmit={handleAccountFormSubmit}
          onCancel={handleCloseAccountForm}
          persons={persons}
        />
      )}
    </div>
  );
};

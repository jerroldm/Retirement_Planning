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
import './InputForm.css';

export const InputForm = ({ onInputsChange, inputs, activeTab, onAssetsSaved }) => {
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

  // Load assets, savings accounts, persons, and income sources when component mounts
  useEffect(() => {
    loadAssets();
    loadSavingsAccounts();
    loadPersons();
    loadIncomeSources();
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
      if (editingAccount) {
        await savingsAccountAPI.updateAccount(editingAccount.id, submittedData);
      } else {
        await savingsAccountAPI.createAccount(submittedData);
      }
      await loadSavingsAccounts();
      setShowAccountForm(false);
      setEditingAccount(null);
      setSelectedAccountType(null);
    } catch (error) {
      console.error('Failed to save account:', error);
      alert('Failed to save account. Please try again.');
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await savingsAccountAPI.deleteAccount(id);
      await loadSavingsAccounts();
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
            <h3>Personal Information</h3>

            <div className="subsection">
              <h4>Persons</h4>
              <PersonList
                persons={persons}
                onEdit={handleEditPerson}
                onDelete={handleDeletePerson}
                onAddPerson={handleAddPersonClick}
              />
            </div>
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
            <h3>Income & Salary</h3>
            <button className="btn btn-primary" onClick={handleAddIncomeClick} style={{ marginBottom: '16px' }}>
              Add Income Source
            </button>
            <IncomeList
              sources={incomeSources}
              onEdit={handleEditIncome}
              onDelete={handleDeleteIncome}
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
            <h3>Retirement Savings Accounts</h3>
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
            <h3>Assets</h3>
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
            <h3>Expenses & Lifestyle</h3>
            <div className="subsection">
              <h4>Pre-Retirement Expenses</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="preRetirementAnnualExpenses">Annual Expenses (before retirement)</label>
                  <input
                    type="number"
                    id="preRetirementAnnualExpenses"
                    name="preRetirementAnnualExpenses"
                    value={formData.preRetirementAnnualExpenses}
                    onChange={handleChange}
                    min="0"
                  />
                  <small style={{marginTop: '4px', color: '#999', fontSize: '12px'}}>
                    Living expenses while working (excluding mortgage)
                  </small>
                </div>
              </div>
            </div>
            <div className="subsection">
              <h4>Post-Retirement Expenses</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="postRetirementAnnualExpenses">Annual Expenses (after retirement)</label>
                  <input
                    type="number"
                    id="postRetirementAnnualExpenses"
                    name="postRetirementAnnualExpenses"
                    value={formData.postRetirementAnnualExpenses}
                    onChange={handleChange}
                    min="0"
                  />
                  <small style={{marginTop: '4px', color: '#999', fontSize: '12px'}}>
                    Living expenses in retirement (excluding mortgage)
                  </small>
                </div>
              </div>
            </div>
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

        {/* Tax Assumptions */}
        {activeTab === 'taxes' && (
          <section className="form-section">
            <h3>Tax Assumptions</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="federalTaxRate">Federal Tax Rate (%)</label>
                <input
                  type="number"
                  id="federalTaxRate"
                  name="federalTaxRate"
                  value={formData.federalTaxRate}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="stateTaxRate">State Tax Rate (%)</label>
                <input
                  type="number"
                  id="stateTaxRate"
                  name="stateTaxRate"
                  value={formData.stateTaxRate}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                />
              </div>
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

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

  // Load assets and savings accounts when component mounts
  useEffect(() => {
    loadAssets();
    loadSavingsAccounts();
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

  const loadAssets = async () => {
    try {
      setAssetsLoading(true);

      // Attempt to migrate home data from financial_data table
      try {
        const migrationResult = await assetAPI.migrateHomeData();
        if (migrationResult.migrated) {
          console.log('Home data migrated successfully');
        }
      } catch (migrationError) {
        console.log('Home data migration skipped or already migrated:', migrationError.message);
      }

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
              <h4>Marital Status</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="maritalStatus">Status</label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus || 'single'}
                    onChange={handleChange}
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="subsection">
              <h4>You (Person 1)</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="birthMonth">Birth Month</label>
                  <select
                    id="birthMonth"
                    name="birthMonth"
                    value={formData.birthMonth || ''}
                    onChange={handleChange}
                  >
                    <option value="">Select Month</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="birthYear">Birth Year</label>
                  <input
                    type="number"
                    id="birthYear"
                    name="birthYear"
                    value={formData.birthYear || ''}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="form-group">
                  <label>Current Age</label>
                  <div style={{padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold'}}>
                    {calculateAge(formData.birthMonth, formData.birthYear)}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="retirementAge">Retirement Age</label>
                  <input
                    type="number"
                    id="retirementAge"
                    name="retirementAge"
                    value={formData.retirementAge}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contributionStopAge">Contribution Stop Age</label>
                  <input
                    type="number"
                    id="contributionStopAge"
                    name="contributionStopAge"
                    value={formData.contributionStopAge}
                    onChange={handleChange}
                    min="1"
                  />
                  <small style={{marginTop: '4px', color: '#999', fontSize: '12px'}}>
                    Age when contributions stop
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="deathAge">Planning Until Age</label>
                  <input
                    type="number"
                    id="deathAge"
                    name="deathAge"
                    value={formData.deathAge}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>
            </div>

            {formData.maritalStatus === 'married' && (
              <div className="subsection">
                <h4>Spouse (Person 2)</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="spouse2BirthMonth">Birth Month</label>
                    <select
                      id="spouse2BirthMonth"
                      name="spouse2BirthMonth"
                      value={formData.spouse2BirthMonth || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select Month</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="spouse2BirthYear">Birth Year</label>
                    <input
                      type="number"
                      id="spouse2BirthYear"
                      name="spouse2BirthYear"
                      value={formData.spouse2BirthYear || ''}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Age</label>
                    <div style={{padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold'}}>
                      {calculateAge(formData.spouse2BirthMonth, formData.spouse2BirthYear)}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="spouse2RetirementAge">Retirement Age</label>
                    <input
                      type="number"
                      id="spouse2RetirementAge"
                      name="spouse2RetirementAge"
                      value={formData.spouse2RetirementAge || ''}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="spouse2ContributionStopAge">Contribution Stop Age</label>
                    <input
                      type="number"
                      id="spouse2ContributionStopAge"
                      name="spouse2ContributionStopAge"
                      value={formData.spouse2ContributionStopAge || ''}
                      onChange={handleChange}
                      min="1"
                    />
                    <small style={{marginTop: '4px', color: '#999', fontSize: '12px'}}>
                      Age when contributions stop
                    </small>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Income & Salary */}
        {activeTab === 'income' && (
          <section className="form-section">
            <h3>Income & Salary</h3>

            <div className="subsection">
              <h4>You (Person 1)</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="currentSalary">Current Annual Salary</label>
                  <input
                    type="number"
                    id="currentSalary"
                    name="currentSalary"
                    value={formData.currentSalary}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="annualSalaryIncrease">Annual Salary Increase (%)</label>
                  <input
                    type="number"
                    id="annualSalaryIncrease"
                    name="annualSalaryIncrease"
                    value={formData.annualSalaryIncrease}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {formData.maritalStatus === 'married' && (
              <div className="subsection">
                <h4>Spouse (Person 2)</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="spouse2CurrentSalary">Current Annual Salary</label>
                    <input
                      type="number"
                      id="spouse2CurrentSalary"
                      name="spouse2CurrentSalary"
                      value={formData.spouse2CurrentSalary || ''}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="spouse2AnnualSalaryIncrease">Annual Salary Increase (%)</label>
                    <input
                      type="number"
                      id="spouse2AnnualSalaryIncrease"
                      name="spouse2AnnualSalaryIncrease"
                      value={formData.spouse2AnnualSalaryIncrease || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
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
        />
      )}
    </div>
  );
};

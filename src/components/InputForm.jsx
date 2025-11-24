import React, { useState, useEffect } from 'react';
import { defaultInputs, calculateAge } from '../utils/calculations';
import { AssetList } from './AssetList';
import { AssetTypeSelector } from './AssetTypeSelector';
import { AssetForm } from './AssetForm';
import { assetAPI } from '../api/assetClient';
import './InputForm.css';

export const InputForm = ({ onInputsChange, inputs, activeTab }) => {
  const [formData, setFormData] = useState(inputs || defaultInputs);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [showAssetTypeSelector, setShowAssetTypeSelector] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);

  // Load assets when component mounts
  useEffect(() => {
    loadAssets();
  }, []);

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

            <div className="subsection">
              <h4>You (Person 1) - Traditional IRA/401(k)</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="traditionalIRA">Current Balance</label>
                  <input
                    type="number"
                    id="traditionalIRA"
                    name="traditionalIRA"
                    value={formData.traditionalIRA}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="traditionalIRAContribution">Annual Employee Contribution</label>
                  <input
                    type="number"
                    id="traditionalIRAContribution"
                    name="traditionalIRAContribution"
                    value={formData.traditionalIRAContribution}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="traditionIRACompanyMatch">Annual Company Match</label>
                  <input
                    type="number"
                    id="traditionIRACompanyMatch"
                    name="traditionIRACompanyMatch"
                    value={formData.traditionIRACompanyMatch}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="subsection">
              <h4>You (Person 1) - Roth IRA/401(k)</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="rothIRA">Current Balance</label>
                  <input
                    type="number"
                    id="rothIRA"
                    name="rothIRA"
                    value={formData.rothIRA}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rothIRAContribution">Annual Employee Contribution</label>
                  <input
                    type="number"
                    id="rothIRAContribution"
                    name="rothIRAContribution"
                    value={formData.rothIRAContribution}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rothIRACompanyMatch">Annual Company Match</label>
                  <input
                    type="number"
                    id="rothIRACompanyMatch"
                    name="rothIRACompanyMatch"
                    value={formData.rothIRACompanyMatch}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="subsection">
              <h4>You (Person 1) - Investment Accounts</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="investmentAccounts">Current Balance</label>
                  <input
                    type="number"
                    id="investmentAccounts"
                    name="investmentAccounts"
                    value={formData.investmentAccounts}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="investmentAccountsContribution">Annual Contribution</label>
                  <input
                    type="number"
                    id="investmentAccountsContribution"
                    name="investmentAccountsContribution"
                    value={formData.investmentAccountsContribution}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {formData.maritalStatus === 'married' && (
              <>
                <div className="subsection">
                  <h4>Spouse (Person 2) - Traditional IRA/401(k)</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="spouse2TraditionalIRA">Current Balance</label>
                      <input
                        type="number"
                        id="spouse2TraditionalIRA"
                        name="spouse2TraditionalIRA"
                        value={formData.spouse2TraditionalIRA || ''}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="spouse2TraditionalIRAContribution">Annual Employee Contribution</label>
                      <input
                        type="number"
                        id="spouse2TraditionalIRAContribution"
                        name="spouse2TraditionalIRAContribution"
                        value={formData.spouse2TraditionalIRAContribution || ''}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="spouse2TraditionalIRACompanyMatch">Annual Company Match</label>
                      <input
                        type="number"
                        id="spouse2TraditionalIRACompanyMatch"
                        name="spouse2TraditionalIRACompanyMatch"
                        value={formData.spouse2TraditionalIRACompanyMatch || ''}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="subsection">
                  <h4>Spouse (Person 2) - Roth IRA/401(k)</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="spouse2RothIRA">Current Balance</label>
                      <input
                        type="number"
                        id="spouse2RothIRA"
                        name="spouse2RothIRA"
                        value={formData.spouse2RothIRA || ''}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="spouse2RothIRAContribution">Annual Employee Contribution</label>
                      <input
                        type="number"
                        id="spouse2RothIRAContribution"
                        name="spouse2RothIRAContribution"
                        value={formData.spouse2RothIRAContribution || ''}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="spouse2RothIRACompanyMatch">Annual Company Match</label>
                      <input
                        type="number"
                        id="spouse2RothIRACompanyMatch"
                        name="spouse2RothIRACompanyMatch"
                        value={formData.spouse2RothIRACompanyMatch || ''}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="subsection">
                  <h4>Spouse (Person 2) - Investment Accounts</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="spouse2InvestmentAccounts">Current Balance</label>
                      <input
                        type="number"
                        id="spouse2InvestmentAccounts"
                        name="spouse2InvestmentAccounts"
                        value={formData.spouse2InvestmentAccounts || ''}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="spouse2InvestmentAccountsContribution">Annual Contribution</label>
                      <input
                        type="number"
                        id="spouse2InvestmentAccountsContribution"
                        name="spouse2InvestmentAccountsContribution"
                        value={formData.spouse2InvestmentAccountsContribution || ''}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
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
    </div>
  );
};

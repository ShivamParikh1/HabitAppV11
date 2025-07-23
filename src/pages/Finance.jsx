import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus, TrendingUp, PiggyBank, Banknote, ShieldCheck, Target, BarChart2, 
  DollarSign, CreditCard, Calendar, PieChart as PieChartIcon, BarChart3, Wallet, ArrowLeft
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPieChart, Cell, LineChart, Line } from 'recharts';
import { format } from 'date-fns';

export default function Finance() {
  const { state, dispatch } = useApp();
  const { financeProfile, liabilities, financeTransactions, financialGoals } = state;
  
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    spending_category: 'Fixed Costs',
    custom_category: '',
    notes: ''
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: ''
  });

  const handleSaveTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) {
      alert("Description and amount are required");
      return;
    }

    dispatch({
      type: 'ADD_FINANCE_TRANSACTION',
      payload: {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      }
    });

    setNewTransaction({
      type: 'expense',
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      spending_category: 'Fixed Costs',
      custom_category: '',
      notes: ''
    });
    setShowTransactionDialog(false);
  };

  const handleSaveGoal = () => {
    if (!newGoal.title || !newGoal.target_amount) {
      alert("Title and target amount are required");
      return;
    }

    dispatch({
      type: 'ADD_FINANCIAL_GOAL',
      payload: {
        ...newGoal,
        target_amount: parseFloat(newGoal.target_amount),
        current_amount: parseFloat(newGoal.current_amount) || 0
      }
    });

    setNewGoal({
      title: '',
      description: '',
      target_amount: '',
      current_amount: '',
      target_date: ''
    });
    setShowGoalDialog(false);
  };

  // Calculate financial stats
  const monthlyTransactions = financeTransactions.filter(t => {
    const tDate = new Date(t.date);
    const [year, month] = currentMonth.split('-');
    return tDate.getFullYear() === parseInt(year) && tDate.getMonth() === parseInt(month) - 1;
  });

  const monthExpenses = monthlyTransactions.filter(t => t.type === 'expense');
  const monthIncome = monthlyTransactions.filter(t => t.type === 'income');

  const totalExpenses = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = monthIncome.reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const fixedCosts = monthExpenses.filter(e => e.spending_category === 'Fixed Costs').reduce((sum, e) => sum + e.amount, 0);
  const guiltFree = monthExpenses.filter(e => e.spending_category === 'Guilt-Free Spending').reduce((sum, e) => sum + e.amount, 0);

  const postTaxIncome = financeProfile ? financeProfile.monthly_income * (1 - (financeProfile.tax_rate || 0) / 100) : 0;
  const investments = (financeProfile?.k401_contribution || 0) + (financeProfile?.roth_ira_contribution || 0);

  let savings = 0;
  if (financeProfile?.savings_goal_type === 'percentage') {
    savings = postTaxIncome * ((financeProfile.savings_goal_value || 0) / 100);
  } else {
    savings = financeProfile?.savings_goal_value || 0;
  }

  const spendingData = [
    { name: 'Fixed Costs', value: fixedCosts, target: postTaxIncome * 0.5 },
    { name: 'Investments', value: investments, target: postTaxIncome * 0.1 },
    { name: 'Savings', value: savings, target: postTaxIncome * 0.1 },
    { name: 'Guilt-Free', value: guiltFree, target: postTaxIncome * 0.3 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={createPageUrl("Features")}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Finance Hub</h1>
          <p className="text-gray-600 mt-1">Your complete financial planning center</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input 
            type="month" 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(e.target.value)} 
            className="w-48" 
          />
          <Button 
            onClick={() => setShowTransactionDialog(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Tabs defaultValue="cash-flow" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="debt">Debt Payoff</TabsTrigger>
        </TabsList>

        <TabsContent value="cash-flow" className="pt-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Banknote className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-xl font-bold">${postTaxIncome.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Post-Tax Income</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ShieldCheck className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-xl font-bold">${fixedCosts.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Fixed Costs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-xl font-bold">${investments.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Investments</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <PiggyBank className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-xl font-bold">${savings.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Savings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-xl font-bold">${guiltFree.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Guilt-Free</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                  {monthlyTransactions.length === 0 ? (
                    <p className="text-gray-500 text-center">No transactions for this month.</p>
                  ) : (
                    monthlyTransactions.slice(0, 10).map(t => (
                      <div key={t.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50">
                        <div>
                          <p className="font-medium">{t.description}</p>
                          <p className="text-xs text-gray-500">{t.custom_category || t.spending_category}</p>
                        </div>
                        <p className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          ${t.amount.toFixed(2)}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Monthly Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Income:</span>
                    <span className="font-bold text-green-600">${totalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <span className="font-bold text-red-600">${totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Net Income:</span>
                    <span className={`font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${netIncome.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="pt-4">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowGoalDialog(true)}>
                <Plus className="w-4 h-4 mr-2" /> New Goal
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {financialGoals.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">
                  <p>No goals set yet. Click "New Goal" to add your first goal!</p>
                </div>
              ) : (
                financialGoals.map(goal => {
                  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                  return (
                    <Card key={goal.id}>
                      <CardHeader><CardTitle>{goal.title}</CardTitle></CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <p className="font-bold text-lg">
                          ${(goal.current_amount || 0).toFixed(2)} / 
                          <span className="text-gray-600"> ${(goal.target_amount || 0).toFixed(2)}</span>
                        </p>
                        <Progress value={progress} className="mt-2" />
                        {goal.target_date && (
                          <p className="text-xs text-gray-500 mt-2">
                            Target: {format(new Date(goal.target_date), 'MMM yyyy')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Investment Plan</CardTitle>
              <p className="text-sm text-gray-600">Automated investing for long-term wealth building</p>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-center">
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-xl font-bold">${(financeProfile?.k401_contribution || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Monthly 401(k)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-xl font-bold">${(financeProfile?.roth_ira_contribution || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Monthly Roth IRA</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-xl font-bold">${investments.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Total Monthly</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debt" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Debt Overview</CardTitle>
              <p className="text-sm text-gray-600">Track your debt payoff progress</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {liabilities.length === 0 ? (
                <p className="text-gray-500 text-center">No debt entries found. Great job staying debt-free!</p>
              ) : (
                liabilities.map(debt => (
                  <Card key={debt.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{debt.name} ({debt.type})</h4>
                        <p className="text-sm text-gray-500">Interest Rate: {(debt.interest_rate || 0)}%</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">${(debt.total_amount || 0).toFixed(2)}</p>
                        <p className="text-xs text-right text-gray-500">
                          Min. Payment: ${(debt.monthly_payment || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add a New Transaction</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Select onValueChange={v => setNewTransaction({ ...newTransaction, type: v })}>
              <SelectTrigger><SelectValue placeholder="Income or Expense..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Description" 
              value={newTransaction.description}
              onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} 
            />
            <Input 
              type="number" 
              placeholder="Amount" 
              value={newTransaction.amount}
              onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })} 
            />
            <Input 
              type="date" 
              value={newTransaction.date}
              onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })} 
            />

            {newTransaction.type === 'expense' && (
              <Select onValueChange={v => setNewTransaction({ ...newTransaction, spending_category: v })}>
                <SelectTrigger><SelectValue placeholder="Spending Category..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed Costs">Fixed Costs</SelectItem>
                  <SelectItem value="Guilt-Free Spending">Guilt-Free Spending</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Input 
              placeholder="Custom Category (e.g., Groceries, Rent)" 
              value={newTransaction.custom_category}
              onChange={e => setNewTransaction({ ...newTransaction, custom_category: e.target.value })} 
            />
            <Textarea 
              placeholder="Notes..." 
              value={newTransaction.notes}
              onChange={e => setNewTransaction({ ...newTransaction, notes: e.target.value })} 
            />
            <Button onClick={handleSaveTransaction} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Save Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create a New Financial Goal</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input 
              placeholder="Goal Title (e.g., House Down Payment)" 
              value={newGoal.title}
              onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} 
            />
            <Textarea 
              placeholder="Description..." 
              value={newGoal.description}
              onChange={e => setNewGoal({ ...newGoal, description: e.target.value })} 
            />
            <Input 
              type="number" 
              placeholder="Target Amount ($)" 
              value={newGoal.target_amount}
              onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })} 
            />
            <Input 
              type="number" 
              placeholder="Current Amount Saved ($)" 
              value={newGoal.current_amount}
              onChange={e => setNewGoal({ ...newGoal, current_amount: e.target.value })} 
            />
            <div>
              <Label>Target Date</Label>
              <Input 
                type="date" 
                value={newGoal.target_date}
                onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })} 
              />
            </div>
            <Button onClick={handleSaveGoal} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Save Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Wallet, 
  Coins, 
  ArrowUpRight, 
  Zap, 
  TrendingUp, 
  Bot, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  RefreshCw, 
  DollarSign, 
  Info, 
  CheckCircle2, 
  Sliders, 
  Play, 
  Layers, 
  Settings, 
  Compass, 
  Lock, 
  MessageSquare, 
  Trash2, 
  Sparkle 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface Vault {
  id: string;
  name: string;
  tokenSymbol: string;
  tokenName: string;
  apy: number;
  baseApy: number;
  aiBoostApy: number;
  tvl: number;
  gasSavedPercent: number;
  riskScore: "Low" | "Medium" | "High";
  strategyDescription: string;
  allocations: { name: string; value: number; color: string }[];
}

interface UserBalance {
  symbol: string;
  balance: number;
  decimals: number;
}

export default function ArcaneNexus() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // Navigation & Tab state
  const [activeTab, setActiveTab] = useState<'landing' | 'vaults' | 'analytics' | 'advisor'>('landing');
  
  // Wallet state
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletConnecting, setWalletConnecting] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalances, setWalletBalances] = useState<UserBalance[]>([
    { symbol: 'USDC', balance: 25000.00, decimals: 6 },
    { symbol: 'ETH', balance: 12.45, decimals: 18 },
    { symbol: 'ARC', balance: 450.00, decimals: 18 },
  ]);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  // Vault states
  const vaults: Vault[] = useMemo(() => [
    {
      id: "arc-alpha-usdc",
      name: "Arcane Alpha USDC Vault",
      tokenSymbol: "USDC",
      tokenName: "USD Coin",
      apy: 24.2,
      baseApy: 16.5,
      aiBoostApy: 7.7,
      tvl: 12450000,
      gasSavedPercent: 92,
      riskScore: "Low",
      strategyDescription: "Delta-neutral yield harvesting across Aave V3 Arc networks combined with dynamic liquidity provisioning on Curve V2.",
      allocations: [
        { name: "Aave V3 Arc", value: 45, color: "#9333ea" },
        { name: "Curve V2 Pool", value: 35, color: "#06b6d4" },
        { name: "Uni V4 Concentrated", value: 20, color: "#10b981" }
      ]
    },
    {
      id: "aura-quantum-eth",
      name: "Aura Quantum ETH Vault",
      tokenSymbol: "ETH",
      tokenName: "Ethereum",
      apy: 18.5,
      baseApy: 12.1,
      aiBoostApy: 6.4,
      tvl: 38200000,
      gasSavedPercent: 87,
      riskScore: "Low",
      strategyDescription: "Leveraged liquid staking token (LST) yielding on Lido & RocketPool, hedges liquidation profiles using predictive volatility models.",
      allocations: [
        { name: "Rocket Pool rETH", value: 50, color: "#3b82f6" },
        { name: "Lido stETH Leap", value: 30, color: "#10b981" },
        { name: "Volatility Hedge Opt", value: 20, color: "#eab308" }
      ]
    },
    {
      id: "nexus-lst-dual",
      name: "Nexus Arc-LST Duo",
      tokenSymbol: "ARC",
      tokenName: "Arc Network Token",
      apy: 32.1,
      baseApy: 22.0,
      aiBoostApy: 10.1,
      tvl: 8500000,
      gasSavedPercent: 95,
      riskScore: "Medium",
      strategyDescription: "Orchestrated dual reward pool allocation staking ARC against high-yield liquid derivatives on proprietary ArcNetwork contracts.",
      allocations: [
        { name: "Arc Stake Engine", value: 60, color: "#a855f7" },
        { name: "Liquid Duo Incentives", value: 30, color: "#ec4899" },
        { name: "Ecosystem Farm V4", value: 10, color: "#f43f5e" }
      ]
    },
    {
      id: "sol-cascade-usdt",
      name: "Sol-Cascade Omni USDT",
      tokenSymbol: "USDC",
      tokenName: "USD Coin Omni",
      apy: 14.8,
      baseApy: 10.4,
      aiBoostApy: 4.4,
      tvl: 16120000,
      gasSavedPercent: 84,
      riskScore: "High",
      strategyDescription: "Aggressive cross-chain arbitrage and automated basis trading capitalizing on Solana/Arbitrum gas imbalances.",
      allocations: [
        { name: "Solana Arbitrage", value: 40, color: "#06b6d4" },
        { name: "Arbitrum Basis Farm", value: 40, color: "#10b981" },
        { name: "Cross-Chain Gas Opt", value: 20, color: "#a855f7" }
      ]
    }
  ], []);

  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositError, setDepositError] = useState<string>('');
  
  // Deposit transaction status
  // 'idle' | 'simulating' | 'routing' | 'depositing' | 'success'
  const [txStatus, setTxStatus] = useState<'idle' | 'simulating' | 'routing' | 'depositing' | 'success'>('idle');
  const [txProgressLogs, setTxProgressLogs] = useState<string[]>([]);
  const [userInvestments, setUserInvestments] = useState<{ [key: string]: number }>({
    'arc-alpha-usdc': 4500,
    'aura-quantum-eth': 1.5,
  });

  // Calculate dynamic projected earnings
  const [capitalInvestment, setCapitalInvestment] = useState<number>(10000);
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(12); // Months
  const [compoundingFrequency, setCompoundingFrequency] = useState<'daily' | 'weekly' | 'hourly'>('daily');

  // AI strategy advisor chatbot states
  const [advisorInput, setAdvisorInput] = useState<string>('');
  const [aiChatLogs, setAiChatLogs] = useState<{ role: 'user' | 'assistant'; content: string; time: string }[]>([
    {
      role: 'assistant',
      content: "Welcome, Operator. I am the **ArcaneAI Yield Orchestrator**. I can analyze smart-contract parameters, propose delta-neutral yield strategies, or evaluate liquidation thresholds on the Arc Network. Try clicking a quick directive below or type a query.",
      time: "03:54"
    }
  ]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat to bottom when logs update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatLogs, aiLoading]);

  // Connect Wallet Simulation
  const triggerConnectWallet = (walletType: string) => {
    setWalletConnecting(true);
    setTimeout(() => {
      setWalletConnected(true);
      setWalletConnecting(false);
      setWalletAddress("0xArcE86...ef3a");
      setShowWalletModal(false);
    }, 1500);
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  // Perform Vault Deposit Simulation
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      setDepositError("Please connect your wallet first.");
      return;
    }
    if (!selectedVault) return;

    const numericAmount = parseFloat(depositAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setDepositError("Enter a valid deposit volume.");
      return;
    }

    // Balance check
    const userAsset = walletBalances.find(b => b.symbol === selectedVault.tokenSymbol);
    if (!userAsset || userAsset.balance < numericAmount) {
      setDepositError(`Insufficient ${selectedVault.tokenSymbol} balance.`);
      return;
    }

    setDepositError('');
    setTxStatus('simulating');
    setTxProgressLogs(["Initiating neural routing simulation..."]);

    const logs = [
      "Securing gas estimates on Arc Network (Mainnet v1.4)... [Saved 92%]",
      "Analyzing flash-loan arbitrage routes on dynamic pools...",
      "Quantum contract threshold protection generated. Route secure.",
      "Transferring tokens to ArcaneNexus Vault Contract (0xArcV3...44)",
      "Deploying capital across Aave and concentrated liquidity Pools...",
      "Liquidity Allocated. AI boost yielding locked. Transaction confirmed successfully!"
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex === 0) {
        setTxStatus('routing');
      } else if (currentLogIndex === 3) {
        setTxStatus('depositing');
      }

      setTxProgressLogs(prev => [...prev, logs[currentLogIndex]]);
      currentLogIndex++;

      if (currentLogIndex >= logs.length) {
        clearInterval(interval);
        setTxStatus('success');
        
        // Deduct balance and update user investments
        setWalletBalances(prev => prev.map(b => {
          if (b.symbol === selectedVault.tokenSymbol) {
            return { ...b, balance: Number((b.balance - numericAmount).toFixed(4)) };
          }
          return b;
        }));

        setUserInvestments(prev => ({
          ...prev,
          [selectedVault.id]: Number(((prev[selectedVault.id] || 0) + numericAmount).toFixed(4))
        }));
      }
    }, 1000);
  };

  const closeDepositDrawer = () => {
    setSelectedVault(null);
    setDepositAmount('');
    setTxStatus('idle');
    setTxProgressLogs([]);
    setDepositError('');
  };

  // AI Prompt Helper Click
  const handleQuickDirective = (promptText: string) => {
    setAdvisorInput(promptText);
    triggerAIChat(promptText);
  };

  // Trigger server-side Gemini API call
  const triggerAIChat = async (overridePrompt?: string) => {
    const input = overridePrompt || advisorInput;
    if (!input.trim() || aiLoading) return;

    const userMsg = {
      role: 'user' as const,
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatLogs(prev => [...prev, userMsg]);
    setAdvisorInput('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          context: {
            walletConnected,
            address: walletAddress,
            balances: walletBalances,
            currentInvestments: userInvestments,
            vaultAPYS: vaults.map(v => ({ name: v.name, apy: v.apy }))
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setAiChatLogs(prev => [...prev, {
          role: 'assistant',
          content: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error || "Execution failed inside the blockchain analyzer.");
      }
    } catch (err: any) {
      setAiChatLogs(prev => [...prev, {
        role: 'assistant',
        content: `**SYSTEM ERROR**: Neural module encountered latency. Failed to compile pipeline. Core error details: *${err?.message}*`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Simulator Data calculations
  const simulatedProjection = useMemo(() => {
    const averageApy = 22.4 / 100; // Combine dynamic weighted estimation
    const compoundMultiplier = compoundingFrequency === 'daily' ? 365 : compoundingFrequency === 'weekly' ? 52 : 8760;
    const ratePerPeriod = averageApy / compoundMultiplier;
    const periods = (selectedTimeframe / 12) * compoundMultiplier;
    const finalValue = capitalInvestment * Math.pow(1 + ratePerPeriod, periods);
    const profit = finalValue - capitalInvestment;
    
    // Create chart elements
    const points = [];
    for (let i = 0; i <= selectedTimeframe; i++) {
      const tMonths = i;
      const tPeriods = (tMonths / 12) * compoundMultiplier;
      const val = capitalInvestment * Math.pow(1 + ratePerPeriod, tPeriods);
      const conventionalVal = capitalInvestment * (1 + (0.045 / 12) * tMonths); // 4.5% standard bank high yield
      points.push({
        timeline: `M ${i}`,
        "Arcane AI Yield": Math.round(val),
        "Standard Staking": Math.round(conventionalVal)
      });
    }
    return { points, finalValue: Math.round(finalValue), profit: Math.round(profit) };
  }, [capitalInvestment, selectedTimeframe, compoundingFrequency]);

  // Analytics historical mockup
  const [historicalApyData, setHistoricalApyData] = useState<any[]>([
    { name: 'May 1', ArcaneUSDC: 21.4, ArcaneETH: 16.2, DualARC: 28.5 },
    { name: 'May 5', ArcaneUSDC: 22.8, ArcaneETH: 17.1, DualARC: 29.8 },
    { name: 'May 10', ArcaneUSDC: 24.5, ArcaneETH: 16.9, DualARC: 31.4 },
    { name: 'May 15', ArcaneUSDC: 23.9, ArcaneETH: 18.0, DualARC: 30.2 },
    { name: 'May 20', ArcaneUSDC: 24.1, ArcaneETH: 18.2, DualARC: 32.8 },
    { name: 'May 25', ArcaneUSDC: 24.2, ArcaneETH: 18.5, DualARC: 32.1 },
  ]);

  // Fetch data from backend
  useEffect(() => {
    const fetchStats = async () => {
      if (!walletConnected) return;
      try {
        const response = await fetch(`${BACKEND_URL}/api/portfolio/${walletAddress}/history`);
        const result = await response.json();
        if (result.success && result.data) {
          // Map backend history to chart format
          const mappedData = result.data.map((item: any) => ({
            name: item.date,
            ArcaneUSDC: 20 + item.yield,
            ArcaneETH: 15 + item.yield,
            DualARC: 25 + item.yield
          }));
          setHistoricalApyData(mappedData);
        }
      } catch (err) {
        console.warn("Backend not reachable, using mock data");
      }
    };
    fetchStats();
  }, [BACKEND_URL, walletConnected, walletAddress]);

  return (
    <div className="relative min-h-screen text-[#f1f5f9] bg-[#050608] selection:bg-[#c084fc]/30 overflow-x-hidden font-sans">
      
      {/* Dynamic Cybernetic Laser Glow Panels */}
      <div id="dynamic-glows" className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.12),transparent_60%)] -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08),transparent_60%)] -z-10" />

      {/* Futuristic Border Line Header Decoration */}
      <span className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#9333ea]/50 to-transparent" />

      {/* Top Navigation */}
      <nav id="nexus-header" className="sticky top-0 z-40 bg-[#050608]/85 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-[#9333ea] to-[#06b6d4] p-[1.5px] shadow-lg shadow-purple-500/10">
              <div className="w-full h-full bg-[#050608] rounded-[7px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-space font-bold text-lg tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ARCANE<span className="text-[#a855f7]">NEXUS</span>
              </span>
              <span className="text-[9px] text-[#06b6d4] uppercase font-mono tracking-widest leading-none">
                AI Yield Hub
              </span>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-full">
            <button 
              onClick={() => setActiveTab('landing')}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'landing' ? 'bg-[#9333ea]/15 text-[#c084fc] border border-[#a855f7]/20' : 'text-gray-400 hover:text-white border border-transparent'}`}
            >
              Landing / Core
            </button>
            <button 
              onClick={() => setActiveTab('vaults')}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide tracking-wide transition-all ${activeTab === 'vaults' ? 'bg-[#9333ea]/15 text-[#c084fc] border border-[#a855f7]/20' : 'text-gray-400 hover:text-white border border-transparent'}`}
            >
              Yield Vaults
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'analytics' ? 'bg-[#9333ea]/15 text-[#c084fc] border border-[#a855f7]/20' : 'text-gray-400 hover:text-white border border-transparent'}`}
            >
              Performance Index
            </button>
            <button 
              onClick={() => setActiveTab('advisor')}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'advisor' ? 'bg-[#9333ea]/15 text-[#c084fc] border border-[#a855f7]/20' : 'text-gray-400 hover:text-white border border-transparent'}`}
            >
              ArcaneAI Advisor
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            {/* Live RPC Status */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-md text-[11px] font-mono text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              <span>ARC-RPC ACTIVE</span>
            </div>

            {walletConnected ? (
              <div className="flex items-center gap-2 p-1.5 bg-purple-500/10 border border-purple-500/25 rounded-md">
                <span className="text-xs font-mono text-purple-300">{walletAddress}</span>
                <button 
                  onClick={disconnectWallet}
                  className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/35 transition"
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowWalletModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-xs font-semibold text-white rounded-lg group bg-gradient-to-br from-purple-600 to-cyan-500 group-hover:from-purple-600 group-hover:to-cyan-500 hover:text-white dark:text-white mb-0"
              >
                <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-[#050608] rounded-md group-hover:bg-opacity-0 flex items-center gap-2 leading-none">
                  <Wallet className="w-4 h-4 text-purple-300" />
                  Connect Wallet
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation tabs for smaller screens */}
        <div className="flex md:hidden flex-wrap items-center justify-center gap-1.5 mb-8 p-1.5 bg-white/[0.02] border border-white/5 rounded-xl">
          <button 
            onClick={() => setActiveTab('landing')}
            className={`flex-1 min-w-[120px] py-2 text-center rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${activeTab === 'landing' ? 'bg-[#9333ea]/15 text-[#c084fc] border border-[#a855f7]/20 outline-hidden' : 'text-gray-400 outline-hidden'}`}
          >
            Landing
          </button>
          <button 
            onClick={() => setActiveTab('vaults')}
            className={`flex-1 min-w-[120px] py-2 text-center rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${activeTab === 'vaults' ? 'bg-[#9333ea]/15 text-[#c084fc] border border-[#a855f7]/20 outline-hidden' : 'text-gray-400 outline-hidden'}`}
          >
            Vaults
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 min-w-[120px] py-2 text-center rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${activeTab === 'analytics' ? 'bg-[#9333ea]/15 text-[#c084fc] border border-[#a855f7]/20 outline-hidden' : 'text-gray-400 outline-hidden'}`}
          >
            Index
          </button>
          <button 
            onClick={() => setActiveTab('advisor')}
            className={`flex-1 min-w-[120px] py-2 text-center rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${activeTab === 'advisor' ? 'bg-[#9333ea]/15 text-[#c084fc] border border-[#a855f7]/20 outline-hidden' : 'text-gray-400 outline-hidden'}`}
          >
            Advisor AI
          </button>
        </div>

        {/* TAB 1: CORE LANDING HUB */}
        {activeTab === 'landing' && (
          <div className="space-y-16">
            
            {/* HERO SECTION */}
            <section id="landing-hero" className="relative flex flex-col items-center text-center space-y-6 pt-8 pb-4">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 text-xs text-[#c084fc] font-semibold tracking-wide shadow-xl shadow-purple-950/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                Next Generation Autocompounding Engine
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl font-space leading-tight"
              >
                AI-Driven Yield Orchestrator On The <span className="bg-gradient-to-r from-purple-400 via-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">Arc Network</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed font-sans"
              >
                ArcaneNexus aggregates, optimizes, and routes decentralized liquidity autonomously using predictive multi-chain neural modeling. Maximizing capital efficiency with gasless auto-compounding.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4"
              >
                <motion.button 
                  onClick={() => setActiveTab('vaults')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-[#06b6d4] hover:brightness-110 text-white rounded-xl text-sm font-semibold tracking-wide shadow-xl shadow-purple-500/10 flex items-center gap-2 cursor-pointer transition-all leading-none"
                >
                  Enter Active Vaults
                  <ArrowUpRight className="w-4 h-4" />
                </motion.button>
                
                <motion.button 
                  onClick={() => setActiveTab('advisor')}
                  className="px-8 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-xl text-sm font-semibold tracking-wide text-white transition flex items-center gap-2 leading-none cursor-pointer"
                >
                  Consult ArcaneAI
                  <Bot className="w-4 h-4 text-purple-400" />
                </motion.button>
              </motion.div>

              {/* Protocol Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-12">
                <div className="bg-[#0c0e12]/60 hover:bg-[#0c0e12] border border-white/5 rounded-xl p-4 flex flex-col text-left transition relative">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Total Value Locked</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-space mt-1">$75,270,000</span>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#10b981]" />
                    <span>+14.2% Month-over-month</span>
                  </span>
                </div>
                <div className="bg-[#0c0e12]/60 hover:bg-[#0c0e12] border border-white/5 rounded-xl p-4 flex flex-col text-left transition relative">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Weighted Yield Index</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#10b981] font-space mt-1">22.40% APY</span>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Calculated across 4 pools</span>
                  </span>
                </div>
                <div className="bg-[#0c0e12]/60 hover:bg-[#0c0e12] border border-white/5 rounded-xl p-4 flex flex-col text-left transition relative">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Average Gas Saved</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-space mt-1">91.4%</span>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <span>Batch routing compounding</span>
                  </span>
                </div>
                <div className="bg-[#0c0e12]/60 hover:bg-[#0c0e12] border border-white/5 rounded-xl p-4 flex flex-col text-left transition relative">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Total Active Contracts</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-space mt-1">20,531 Ops</span>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>100% Cryptographic safety</span>
                  </span>
                </div>
              </div>
            </section>

            {/* BENTO GRID VALUE SHOWCASE */}
            <section id="bento-grid" className="space-y-6">
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold font-space">The Algorithmic Advantage</h2>
                <p className="text-xs text-gray-400">Precision cryptoeconomic engineering inside a modular glass grid system.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bento Card 1: AI Routing */}
                <div className="md:col-span-2 relative bg-gradient-to-b from-[#0c0e12] to-[#07080a] border border-white/5 rounded-2xl p-6.5 flex flex-col md:flex-row items-start justify-between gap-6 overflow-hidden hover:border-purple-500/20 transition duration-300">
                  <div className="space-y-4 max-w-md z-10">
                    <div className="p-2 w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-space text-white">Dynamic Yield Routing Intelligence</h3>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                        Our protocol continually maps gas fees, fee rewards, and pool slippages across integrated dexes to allocate user liquidity dynamically. If a vault threshold is reached, our neural advisor routes liquidity autonomously.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-purple-300">
                      <span>• Real-Time Arbitrage</span>
                      <span>• Automatic Rebalancing</span>
                      <span>• Slippage Protection</span>
                    </div>
                  </div>
                  <div className="relative w-full md:w-56 h-40 bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between overflow-hidden">
                    <span className="text-[8px] font-mono text-gray-400">CONCEPTS PIPELINE</span>
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[10px] bg-purple-500/10 p-1.5 border border-purple-500/20 rounded">
                        <span className="font-mono text-purple-300">Optimizing Pool ETH</span>
                        <span className="text-[#10b981] font-bold">+18.5%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] bg-cyan-500/5 p-1.5 border border-white/5 rounded opacity-75">
                        <span className="font-mono text-gray-400">Aggregating Curve USDC</span>
                        <span className="text-gray-400">+16.5%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] bg-slate-500/5 p-1.5 border border-white/5 rounded opacity-50">
                        <span className="font-mono text-gray-500">Traditional Stake Vaults</span>
                        <span className="text-red-400">-4.5%</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-purple-400 text-right">System v1.4 Enabled</span>
                  </div>
                </div>

                {/* Bento Card 2: Gas Economy */}
                <div className="relative bg-gradient-to-b from-[#0c0e12] to-[#07080a] border border-white/5 rounded-2xl p-6.5 flex flex-col justify-between hover:border-[#06b6d4]/20 transition duration-300">
                  <div className="space-y-4">
                    <div className="p-2 w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-space text-white">Gasless Auto-Compounding</h3>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                        Rather than individually claiming rewards and re-staking (which incurs enormous network gas fees), ArcaneNexus claims on a global network interval, batching transactions into a single smart transaction. Saving you up to 95% on gas costs.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
                    <span className="text-xs font-mono text-cyan-300">92% average gas reduction</span>
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                {/* Bento Card 3: Neural Advisor Quick View */}
                <div className="relative bg-gradient-to-b from-[#0c0e12] to-[#07080a] border border-white/5 rounded-2xl p-6.5 flex flex-col justify-between hover:border-emerald-500/20 transition duration-300">
                  <div className="space-y-4">
                    <div className="p-2 w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-space text-white">Real-Time ArcaneAI</h3>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                        Analyze risk and harvest strategies in real-time. Simply prompt our Gemini-driven engine to audit yield risks or formulate complex delta-neutral staking.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => setActiveTab('advisor')}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl transition"
                    >
                      Consult Strategy Engine
                    </button>
                  </div>
                </div>

                {/* Bento Card 4: Algorithmic Vault Calculators */}
                <div className="md:col-span-2 relative bg-gradient-to-b from-[#0c0e12] to-[#07080a] border border-white/5 rounded-2xl p-6.5 hover:border-purple-500/20 transition duration-300">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="space-y-4 max-w-sm">
                      <div className="p-2 w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                        <Sliders className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-space text-white">Predictive Yield Forecaster</h3>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                          Adjust investment thresholds and timeline limits to observe yield compounding advantages in real-time. Watch how small autocompounded intervals outperform regular manual claims.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 space-y-4">
                      {/* Interactive yield slider inside bento */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-gray-400">Principal Deposit ($)</span>
                          <span className="text-purple-400 font-bold">${capitalInvestment.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="1000" 
                          max="100000" 
                          step="1000"
                          value={capitalInvestment}
                          onChange={(e) => setCapitalInvestment(Number(e.target.value))}
                          className="w-full accent-purple-500 bg-white/5 h-1.5 rounded-lg outline-hidden cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-gray-400">Timeframe (Months)</span>
                          <span className="text-purple-400 font-bold">{selectedTimeframe} Months</span>
                        </div>
                        <input 
                          type="range" 
                          min="3" 
                          max="36" 
                          step="3"
                          value={selectedTimeframe}
                          onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
                          className="w-full accent-cyan-500 bg-white/5 h-1.5 rounded-lg outline-hidden cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-left border-t border-white/5 pt-3">
                        <div>
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Projected Portfolio Impact</span>
                          <p className="text-base font-bold text-[#10b981]">${simulatedProjection.finalValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Total Profit (Est)</span>
                          <p className="text-base font-bold text-white">+${simulatedProjection.profit.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* TAB 2: ACTIVE VAULTS INVENTORY (DASHBOARD) */}
        {activeTab === 'vaults' && (
          <div className="space-y-10">
            
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest leading-none">• Active Vault Registry</span>
                <h1 className="text-3xl font-extrabold font-space text-white">Arc Stable Autocompounders</h1>
                <p className="text-xs text-gray-400">Click. Select. Deploy. Yields are harvest-compounded automatically behind high cryptographic security.</p>
              </div>

              {/* Wallet Integration Info Banner */}
              <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono block">Operator Portfolios</span>
                  {walletConnected ? (
                    <span className="text-xs font-bold text-white">Wallet connected • Multi balance active</span>
                  ) : (
                    <button 
                      onClick={() => setShowWalletModal(true)}
                      className="text-xs font-semibold text-purple-300 hover:text-white underline underline-offset-2 transition cursor-pointer"
                    >
                      Connect Wallet to unlock balances
                    </button>
                  )}
                </div>
              </div>
            </header>

            {/* VAULTS LIST GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vaults.map((vault) => {
                const userLocked = userInvestments[vault.id] || 0;
                return (
                  <div
                    key={vault.id}
                    className="group relative bg-[#0c0e12]/60 hover:bg-[#0c0e12]/90 border border-white/5 rounded-2xl p-6.5 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-purple-500/5 hover:-translate-y-0.5 hover:border-white/10"
                  >
                    {/* Header */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center font-bold text-purple-400 font-space text-sm">
                            {vault.tokenSymbol}
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold font-space text-white group-hover:text-purple-300 transition duration-300">
                              {vault.name}
                            </h3>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Managed by ArcaneAI Core
                            </span>
                          </div>
                        </div>

                        {/* APY Flag Badge */}
                        <div className="text-right">
                          <span className="block text-2xl font-black font-space text-[#10b981] tracking-tight">
                            {vault.apy}% <span className="text-xs font-semibold uppercase">APY</span>
                          </span>
                          <span className="text-[9px] text-[#06b6d4] font-mono uppercase bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/5 inline-block">
                            +{vault.aiBoostApy}% AI BOOSTED
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed min-h-12 border-b border-white/5 pb-4">
                        {vault.strategyDescription}
                      </p>

                      {/* Stat figures */}
                      <div className="grid grid-cols-3 gap-2 py-1">
                        <div>
                          <span className="block text-[9px] font-mono text-gray-500 uppercase">TVL Depth</span>
                          <span className="text-xs font-bold text-gray-200">${(vault.tvl / 1000000).toFixed(2)}M</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-mono text-gray-500 uppercase">Gas reduction</span>
                          <span className="text-xs font-bold text-cyan-400 flex items-center gap-0.5">
                            <Zap className="w-3 h-3" /> {vault.gasSavedPercent}%
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-mono text-gray-500 uppercase">Risk Index</span>
                          <span className={`text-xs font-bold ${vault.riskScore === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {vault.riskScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Deposit form button triggers */}
                    <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between gap-4">
                      <div>
                        <span className="block text-[8px] font-mono text-gray-500 uppercase">Your Active capital</span>
                        <span className="text-xs font-bold text-white">
                          {userLocked > 0 ? `${userLocked.toLocaleString()} ${vault.tokenSymbol}` : '0.00 Locked'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedVault(vault);
                          setTxStatus('idle');
                        }}
                        className="px-4.5 py-2 hover:brightness-110 bg-purple-600 font-semibold rounded-lg text-xs tracking-wide text-white transition hover:shadow-lg shadow-purple-500/10 flex items-center gap-1.5 cursor-pointer leading-none"
                      >
                        Launch Console
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DYNAMIC CALULATOR HARVEST */}
            <section className="bg-gradient-to-r from-[#0c0e12] to-[#07080a] border border-white/5 rounded-2xl p-6.5 mt-8">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                
                {/* Dynamic Calculator Configs */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-space flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      Dynamic Compounding Calculator
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Simulate historical APY compound differences utilizing real protocol data weighting.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-gray-400 uppercase">Deployment Capital ($)</label>
                      <input 
                        type="number"
                        value={capitalInvestment}
                        onChange={(e) => setCapitalInvestment(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-sm font-semibold tracking-wide text-white outline-hidden focus:border-purple-500/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-gray-400 uppercase">Asset Harvest Period</label>
                      <select 
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white outline-hidden focus:border-purple-500/40"
                      >
                        <option value={3}>3 Months Staking</option>
                        <option value={6}>6 Months Staking</option>
                        <option value={12}>1 Year Cycle (12M)</option>
                        <option value={24}>2 Year Cycle (24M)</option>
                        <option value={36}>3 Year Cycle (36M)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-mono text-gray-400 uppercase block">Dynamic Compounding Interval</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['hourly', 'daily', 'weekly'].map((freq) => (
                          <button
                            key={freq}
                            onClick={() => setCompoundingFrequency(freq as any)}
                            className={`py-2 px-3 text-xs font-semibold rounded-lg capitalize border transition ${
                              compoundingFrequency === freq 
                                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300' 
                                : 'bg-transparent border-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            {freq} Compounding
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Chart Outputs */}
                <div className="flex-1 shrink-0 bg-black/40 border border-white/5 rounded-xl p-5.5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase">Growth forecast</span>
                      <span className="text-[10px] text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20 font-bold uppercase">
                        22.40% APY WEIGHTED
                      </span>
                    </div>

                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simulatedProjection.points}>
                          <XAxis dataKey="timeline" stroke="#545954" fontSize={10} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0c0e12', border: '1px solid rgba(255,255,255,0.1)' }}
                            labelClassName="text-xs font-mono text-purple-400"
                          />
                          <Line type="monotone" dataKey="Arcane AI Yield" stroke="#a855f7" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="Standard Staking" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[10px] text-gray-500 italic text-center">
                      *Solid line demonstrates ArcaneAI compounding returns. Dotted line simulates dynamic High-Yield Savings models.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-4">
                    <div>
                      <span className="block text-[9px] font-mono text-gray-500 uppercase">Principal Balance</span>
                      <span className="text-sm font-bold text-gray-400">${capitalInvestment.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-purple-400 uppercase">Compounded Value</span>
                      <span className="text-base font-bold text-white">${simulatedProjection.finalValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* TAB 3: PERFORMANCE INDEX (ANALYTICS) */}
        {activeTab === 'analytics' && (
          <div className="space-y-10">
            <header className="space-y-1">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest leading-none">• Cryptographic Ledger Metrics</span>
              <h1 className="text-3xl font-extrabold font-space text-white">Historical Performance Index</h1>
              <p className="text-xs text-gray-400">Verifiably track pool yield shifts, APY metrics, and algorithmic stability logs.</p>
            </header>

            {/* Performance charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Vault yield trends chart */}
              <div className="lg:col-span-2 bg-[#0c0e12]/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-1 mb-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#06b6d4]" />
                    Dynamic APY Performance Trends (Past 30 Days)
                  </h3>
                  <p className="text-xs text-gray-400">Comparing harvested yields across the core 3 stable networks.</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalApyData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: '#0c0e12', border: '1px solid rgba(255,255,255,0.08)' }} />
                      <Line type="monotone" dataKey="ArcaneUSDC" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} name="USD Alpha" />
                      <Line type="monotone" dataKey="ArcaneETH" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} name="ETH Quantum" />
                      <Line type="monotone" dataKey="DualARC" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="ARC Duo" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Asset Allocation breakdown pie chart */}
              <div className="bg-[#0c0e12]/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-1 mb-6">
                  <h3 className="text-sm font-bold text-white">Consolidated TVL Allocations</h3>
                  <p className="text-xs text-gray-400">Cross-pool capital distribution under management.</p>
                </div>

                <div className="h-52 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'USDC Alpha', value: 12450000, color: '#9333ea' },
                          { name: 'ETH Quantum', value: 38200000, color: '#06b6d4' },
                          { name: 'ARC Duo', value: 8500000, color: '#10b981' },
                          { name: 'USDT Solana', value: 16120000, color: '#3b82f6' }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#9333ea" />
                        <Cell fill="#06b6d4" />
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> USDC Alpha</span>
                    <span className="font-bold text-white">$12.45M (16.5%)</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /> ETH Quantum</span>
                    <span className="font-bold text-white">$38.20M (50.7%)</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> ARC Duo</span>
                    <span className="font-bold text-white">$8.50M (11.3%)</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> USDT Solana</span>
                    <span className="font-bold text-white">$16.12M (21.4%)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: ARCANEAI STRATEGIST CHAT (AI ADVISOR) */}
        {activeTab === 'advisor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Strategy Sidebar & Quick Prompts */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest leading-none block">• Artificial Strategy Orchestrator</span>
                <h1 className="text-2xl font-bold font-space text-white">ArcaneAI neural Strategy</h1>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Powered by custom Google Gemini server integrations, our core advisor generates risk auditing, smart pool diagnostics, and mathematically perfect allocation.
                </p>
              </div>

              {/* Real-time configuration metrics */}
              <div className="bg-[#0b0c0f] border border-white/5 rounded-xl p-4 space-y-4">
                <span className="text-[10px] uppercase font-mono text-purple-300">Strategy Parameters</span>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Advisory Model</span>
                    <span className="font-mono text-white text-[11px]">Gemini 3.5 Flash</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">System State</span>
                    <span className="font-mono text-[#10b981]">Active & Synchronized</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Audit Protocol</span>
                    <span className="font-mono text-white">EIP-4337 Compliant</span>
                  </div>
                </div>
              </div>

              {/* Direct query triggers */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Quick Directives</span>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleQuickDirective("What is the absolute best yield option for my USDC balances?")}
                    className="w-full text-left p-3 text-xs bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl text-gray-300 transition duration-200 outline-hidden flex justify-between items-center group cursor-pointer"
                  >
                    <span>Best USDC Yield Option</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 opacity-60 group-hover:opacity-100" />
                  </button>
                  <button 
                    onClick={() => handleQuickDirective("Audit safety levels of the Aura Quantum ETH pool.")}
                    className="w-full text-left p-3 text-xs bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl text-gray-300 transition duration-200 outline-hidden flex justify-between items-center group cursor-pointer"
                  >
                    <span>Audit Aura Quantum ETH Vault</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 opacity-60 group-hover:opacity-100" />
                  </button>
                  <button 
                    onClick={() => handleQuickDirective("Explain gas compounding and batch transaction reductions.")}
                    className="w-full text-left p-3 text-xs bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl text-gray-300 transition duration-200 outline-hidden flex justify-between items-center group cursor-pointer"
                  >
                    <span>How batch compounding saves gas</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 opacity-60 group-hover:opacity-100" />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Advisor Chat Panel */}
            <div className="lg:col-span-2 bg-[#0c0e12]/60 border border-white/5 rounded-2xl flex flex-col justify-between h-[520px] overflow-hidden shadow-2xl relative">
              <span className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#9333ea]/35 to-transparent" />
              
              {/* Header */}
              <div className="bg-black/30 px-5 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
                  <span className="text-xs font-bold font-space text-white tracking-wide">ArcaneAI Terminal Connection</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase">Secure AES Router</span>
              </div>

              {/* Chat flow logs */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs sm:text-sm">
                {aiChatLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col space-y-1 ${log.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-500">
                      <span>{log.role === 'user' ? 'Operator' : 'ArcaneAI Orchestration Server'}</span>
                      <span>•</span>
                      <span>{log.time}</span>
                    </div>

                    <div 
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        log.role === 'user' 
                          ? 'bg-purple-600/90 text-white rounded-tr-none' 
                          : 'bg-white/[0.03] text-gray-200 border border-white/5 rounded-tl-none font-sans text-xs shadow-md'
                      }`}
                    >
                      {log.content}
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex flex-col space-y-1 items-start">
                    <span className="text-[9px] font-mono text-purple-400">ArcaneAI calculating routes...</span>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex items-center gap-2 text-xs text-gray-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                      <span>Slipping pool parameters map active...</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Action input bar */}
              <div className="bg-black/40 border-t border-white/5 p-4 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Pose yield parameters or audit directives (e.g. Compare Safe vs Hyper risk levels)..."
                  value={advisorInput}
                  onChange={(e) => setAdvisorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && triggerAIChat()}
                  className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs font-semibold text-white outline-hidden focus:border-purple-500/30"
                />
                <button
                  onClick={() => triggerAIChat()}
                  disabled={!advisorInput.trim() || aiLoading}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition duration-200 leading-none cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-24 border-t border-white/5 bg-[#050608] py-10 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#545954] font-mono">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-500" />
            <span className="text-gray-400 font-space font-semibold tracking-wider">ARCANE<span className="text-purple-400">NEXUS</span></span>
            <span className="text-gray-600">| Powered by Google AI Studio</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500">
            <span className="hover:text-white transition cursor-pointer">Protocol Security Audit Passed</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">Mainnet status: Synchronized</span>
            <span>•</span>
            <span className="flex items-center gap-1">Made with <Sparkle className="w-3.5 h-3.5 text-purple-400 fill-purple-400" /> globally</span>
          </div>
        </div>
      </footer>

      {/* WALLET CONNECTION SELECTION DIALOG MODAL */}
      <AnimatePresence>
        {showWalletModal && (
          <div id="wallet-modal-surface" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0c10] border border-white/10 p-6 rounded-2xl max-w-sm w-full space-y-6 relative shadow-2xl"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-space text-white">Connect Web3 Wallet</h3>
                <p className="text-xs text-gray-400">Select your preferred cryptographic wallet client to sync with Arc Network balances.</p>
              </div>

              {walletConnecting ? (
                <div className="py-8 flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                  <span className="text-xs font-mono text-purple-300 font-bold uppercase tracking-widest animate-pulse">Syncing Cryptographic State...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <button 
                    onClick={() => triggerConnectWallet('arc')}
                    className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl text-left transition group outline-hidden cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-white font-space">Arcane Network Core Wallet</span>
                    <span className="px-2 py-0.5 text-[9px] bg-purple-500/10 border border-purple-500/25 rounded-md font-mono text-purple-300">NATIVE</span>
                  </button>

                  <button 
                    onClick={() => triggerConnectWallet('metamask')}
                    className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl text-left transition group outline-hidden cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-white font-space">MetaMask Extension</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
                  </button>

                  <button 
                    onClick={() => triggerConnectWallet('coinbase')}
                    className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl text-left transition group outline-hidden cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-white font-space">Coinbase Wallet</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
                  </button>
                  
                  <button 
                    onClick={() => triggerConnectWallet('walletconnect')}
                    className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl text-left transition group outline-hidden cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-white font-space">WalletConnect Protocol</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowWalletModal(false)}
                className="w-full py-2.5 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition outline-hidden cursor-pointer"
              >
                Close Panel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED VAULT CONSOLE DRAWER MODAL */}
      <AnimatePresence>
        {selectedVault && (
          <div id="vault-drawer-surface" className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/75 backdrop-blur-xs">
            {/* Background close area */}
            <div className="absolute inset-0" onClick={closeDepositDrawer} />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-full bg-[#0b0c10] border-l border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
            >
              
              <div className="space-y-6">
                
                {/* Header context */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold font-space text-purple-400">
                      {selectedVault.tokenSymbol}
                    </div>
                    <div>
                      <h3 className="font-extrabold font-space text-white leading-none text-base">{selectedVault.name}</h3>
                      <span className="text-[10px] text-gray-500 font-mono">Managed Autocompound strategy</span>
                    </div>
                  </div>
                  <button 
                    onClick={closeDepositDrawer}
                    className="p-1.5 hover:bg-white/5 border border-white/5 rounded-lg text-gray-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {txStatus === 'idle' ? (
                  <form onSubmit={handleDepositSubmit} className="space-y-6">
                    
                    {/* APY stats banner */}
                    <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div>
                        <span className="block text-[9px] font-mono text-gray-500 uppercase">Interactive APY</span>
                        <span className="text-xl font-bold text-[#10b981] font-space">{selectedVault.apy}%</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-gray-500 uppercase">Average Gas Saved</span>
                        <span className="text-xl font-bold text-cyan-400 font-space">{selectedVault.gasSavedPercent}%</span>
                      </div>
                    </div>

                    {/* Deposit configuration inputs */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-mono text-gray-400 uppercase">Liquidity Deposit Volume</label>
                        <span className="font-mono text-gray-500">
                          Available: {
                            walletConnected 
                              ? `${walletBalances.find(b => b.symbol === selectedVault.tokenSymbol)?.balance || 0} ${selectedVault.tokenSymbol}` 
                              : "Wallet Offline"
                          }
                        </span>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-lg font-bold text-white outline-hidden focus:border-purple-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (walletConnected) {
                              const bal = walletBalances.find(b => b.symbol === selectedVault.tokenSymbol)?.balance || 0;
                              setDepositAmount(bal.toString());
                            }
                          }}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-lg text-[10px] font-mono font-bold uppercase transition"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    {/* Estimated calculations */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-4">
                      <span className="text-[10px] uppercase font-mono text-gray-500 font-bold block">Yearly Revenue Estimates</span>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-gray-400">
                          <span>Projected profit (1 Yr @ {selectedVault.apy}%)</span>
                          <span className="text-white font-mono font-semibold">
                            +{depositAmount ? (parseFloat(depositAmount) * (selectedVault.apy / 100)).toFixed(2) : "0.00"} {selectedVault.tokenSymbol}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Total gas fees saved estimate</span>
                          <span className="text-cyan-400 font-mono font-semibold">
                            ~$45.00 saves ARC
                          </span>
                        </div>
                      </div>
                    </div>

                    {depositError && (
                      <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {depositError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={!walletConnected || !depositAmount}
                      className="w-full py-4.5 bg-gradient-to-r from-purple-600 to-[#06b6d4] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition cursor-pointer leading-none"
                    >
                      {walletConnected ? "Confirm & Deploy capital to Arc Network" : "Connect wallet to deploy capital"}
                    </button>
                  </form>
                ) : (
                  /* Live active transaction progress console */
                  <div className="space-y-6">
                    <div className="text-center py-6 space-y-2">
                      <div className="inline-flex relative">
                        {txStatus !== 'success' && (
                          <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                        )}
                        <div className={`p-4 rounded-full ${txStatus === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-purple-500/15 text-purple-400'}`}>
                          {txStatus === 'success' ? (
                            <CheckCircle2 className="w-8 h-8" />
                          ) : (
                            <RefreshCw className="w-8 h-8 animate-spin" />
                          )}
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white capitalize">
                        {txStatus === 'success' ? "Staking transaction verified" : "Compounding Route execution"}
                      </h4>
                      <p className="text-xs text-gray-400">Executing mathematical yield harvesting parameters...</p>
                    </div>

                    {/* Simulated terminal logging pipeline */}
                    <div className="bg-black/80 border border-white/5 rounded-xl p-4.5 h-52 overflow-y-auto space-y-2.5 font-mono text-[10px] text-gray-400">
                      {txProgressLogs.map((log, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-purple-400 select-none">&gt;</span>
                          <span className="leading-normal">{log}</span>
                        </div>
                      ))}
                    </div>

                    {txStatus === 'success' && (
                      <button
                        onClick={closeDepositDrawer}
                        className="w-full py-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-xl text-xs font-bold text-white transition cursor-pointer"
                      >
                        Exit console
                      </button>
                    )}
                  </div>
                )}
                
              </div>

              {/* Security disclosures */}
              <div className="text-[10px] text-gray-500 italic space-y-2.5 border-t border-white/5 pt-4">
                <p>
                  *Yield aggregates automatically claim, swap, and reallocate dynamically behind audited multisig parameters. Smart contract investment holds potential asset variance risks.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Inline missing feather icons helper to avoid linter import crashes
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}

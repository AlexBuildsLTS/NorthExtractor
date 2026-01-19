# ApexScrape: AI-Powered Intelligence Hub

<div align="center">

[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue.svg)](https://expo.dev)
[![Framework](https://img.shields.io/badge/Framework-React%20Native-61DAFB.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK%2051-000020.svg)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org)
[![Backend](https://img.shields.io/badge/Backend-Supabase-3ECF8E.svg)](https://supabase.com)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75FF.svg)](https://deepmind.google/technologies/gemini/)

</div>

## 🌟 The Future of Web Intelligence

**ApexScrape** is an enterprise-grade data extraction and synthesis platform that transforms the unstructured web into actionable intelligence. By combining **Google Gemini AI** with a high-performance **Supabase Edge** infrastructure, ApexScrape enables users to build, deploy, and monitor complex web scraping pipelines directly from a mobile interface.

The application leverages the "Apex Logic" architecture to provide seamless data harvesting:

- **AI-Driven Data Synthesis**: Utilizes Google Gemini to parse raw HTML/DOM structures into clean, structured JSON, eliminating the need for brittle, manual selector maintenance.
- **Dynamic Schema Building**: The `SchemaBuilder` engine allows users to define custom data models on the fly, ensuring that the extracted data fits perfectly into their specific business workflows.
- **Glassmorphism UI Engine**: A bespoke visual language built on **Reanimated 4** (Experimental/Next-gen) and **NativeWind**, providing a high-fidelity "AAA" tier user experience with real-time blur effects and fluid transitions.
- **Edge-Computed Harvesting**: Scraping logic is offloaded to Supabase Edge Functions using Puppeteer and Cheerio, ensuring maximum performance without consuming device resources.

---

## ✨ Enterprise-Grade Features

### 🤖 **Cognitive Extraction (Gemini AI)**
- **Semantic Parsing**: No more broken CSS selectors. Gemini identifies data points (prices, titles, stock levels) based on context and visual hierarchy.
- **Insight Generation**: Automatically summarizes scraped data and identifies trends or anomalies in real-time.
- **Natural Language Chat**: A dedicated AI Chat interface (`ai-chat.tsx`) to query your harvested data using RAG (Retrieval-Augmented Generation).

### 🛠️ **Professional Scraping Engine**
- **Headless Orchestration**: Industrial-scale scraping via Supabase Edge Functions (`scrape-engine`) capable of bypassing basic bot detection.
- **Custom Schema Architect**: Visual builder for defining extraction rules, supporting nested objects and arrays.
- **Real-time Monitoring**: Instant feedback on scrape status, success rates, and data throughput.

### 💎 **Next-Gen UI/UX**
- **Glassmorphism Design**: Extensive use of `GlassCard` and `AAAWrapper` components for a modern, depth-based aesthetic.
- **Fluid Animations**: Optimized 60FPS transitions using Reanimated, providing a native-plus feel.
- **Intuitive Navigation**: File-based routing via Expo Router for a logical and scalable app structure.

### 🔒 **Secure Infrastructure**
- **Atomic Auth**: Robust authentication flow powered by Supabase Auth with granular RLS (Row Level Security) policies.
- **Encrypted Environment**: Secure handling of API keys and scraping proxies via Supabase Vault and Edge secrets.
- **App Store Compliant**: Architected specifically to meet Apple and Google's performance and security guidelines.

---

## 🛠️ Technical Architecture

### **Core Frontend Stack**
- **Framework**: React Native (Hermes Engine)
- **SDK**: Expo 51+
- **Navigation**: Expo Router (Typed)
- **Styling**: NativeWind (Tailwind CSS)
- **Animations**: React Native Reanimated
- **Icons**: Lucide React Native (via custom `Icons` wrapper)

### **Cloud & Intelligence**
- **AI Engine**: Google Gemini Flash/Pro (Native Integration)
- **Backend Logic**: Supabase Edge Functions (Deno Runtime)
- **Database**: PostgreSQL with PostgREST
- **Scraping**: Puppeteer / Cheerio / Node-Fetch
- **State Management**: Context API with specialized `AuthContext`

---

## 🚀 Implementation Roadmap

1. [x] **Phase 1**: Core Architecture & UI Foundation (Glassmorphism Engine)
2. [ ] **Phase 2**: Supabase Edge Function Scraping Logic (Puppeteer Integration)
3. [ ] **Phase 3**: Gemini AI Integration for Data Processing & Insight
4. [ ] **Phase 4**: Advanced Schema Builder & Chat Interface
5. [ ] **Phase 5**: Production Hardening & App Store Optimization
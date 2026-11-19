import React from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Playground } from "@/components/Playground";
import { SsrfSandbox } from "@/components/SsrfSandbox";
import { TechRadar } from "@/components/TechRadar";
import { Features } from "@/components/Features";
import { UseCases } from "@/components/UseCases";
import { ApiDocs } from "@/components/ApiDocs";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
      <Header />
      <Hero />
      <Playground />
      <SsrfSandbox />
      <TechRadar />
      <Features />
      <UseCases />
      <ApiDocs />
      <Pricing />
      <Footer />
    </main>
  );
}

import React from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Playground } from "@/components/Playground";
import { AgentWorkbench } from "@/components/AgentWorkbench";
import { SsrfSandbox } from "@/components/SsrfSandbox";
import { TechRadar } from "@/components/TechRadar";
import { Features } from "@/components/Features";
import { UseCases } from "@/components/UseCases";
import { ApiDocs } from "@/components/ApiDocs";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#f7f6f2] text-[#0e1014] antialiased selection:bg-[#0e1014] selection:text-[#f7f6f2]">
      <Header />
      <Hero />
      <Playground />
      <AgentWorkbench />
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

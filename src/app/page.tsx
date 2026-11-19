import React from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Playground } from "@/components/Playground";
import { Features } from "@/components/Features";
import { UseCases } from "@/components/UseCases";
import { ApiDocs } from "@/components/ApiDocs";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Header />
      <Hero />
      <Playground />
      <Features />
      <UseCases />
      <ApiDocs />
      <Pricing />
      <Footer />
    </main>
  );
}

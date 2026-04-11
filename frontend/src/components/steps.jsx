"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Zap, BarChart3 } from 'lucide-react';

const steps = [
    {
        num: "01",
        icon: Upload,
        title: "Upload Data",
        desc: "Simply drag & drop your CSV or connect your database. We automatically detect schema and data types.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        num: "02",
        icon: Zap,
        title: "Auto-Train",
        desc: "Our AI engine cleans data, selects the best algorithms, and trains multiple models to find the winner.",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
    {
        num: "03",
        icon: BarChart3,
        title: "Get Insights",
        desc: "Visualize performance, interpret predictions, and deploy your model to production in one click.",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
];

export default function HowItWorks() {
    return (
        <section id="how" className="w-full py-24 px-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
                            From data to production <br className="hidden md:block" />
                            <span className="text-blue-600">in 3 simple steps</span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                            Stop spending weeks on data preprocessing and model selection.
                            AutoModel automates the heavy lifting so you can focus on results.
                        </p>
                    </motion.div>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">

                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-200 dark:bg-slate-800 z-0">
                        <motion.div
                            className="h-full bg-blue-500 origin-left"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="relative z-10 flex flex-col items-center text-center group"
                        >
                            <div className="mt-6 relative" >

                                {/* Text Content */}
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                                    {step.num}   <br />  {step.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
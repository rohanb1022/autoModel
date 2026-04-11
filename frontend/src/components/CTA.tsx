import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
    return (
        <section className="py-32 px-6 border-t border-border relative overflow-hidden flex items-center justify-center min-h-[60vh]">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse-slow" />
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                        Start building models <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary bg-300% animate-gradient">
                            in seconds
                        </span>
                    </h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg md:text-xl leading-relaxed"
                >
                    Join thousands of data professionals using AutoModel to ship machine learning models faster and more reliably.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link to="/signup">
                        <Button
                            size="lg"
                            className="group relative overflow-hidden gap-2 text-lg h-14 px-10 rounded-full transition-all duration-300"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            <Sparkles className="h-5 w-5" />
                            Get Started Free
                            <ArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <p className="mt-4 text-xs text-muted-foreground">
                        No credit card required
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

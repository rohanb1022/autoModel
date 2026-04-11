import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sparkles,
    Github,
    Linkedin,
    Twitter,
    Instagram,
    ArrowRight,
} from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-muted/30 border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="font-bold text-lg tracking-tight">
                                AutoModel Builder
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Empowering data teams to build, deploy, and monitor machine learning models with automated workflows.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link to="/features" className="hover:text-primary transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="hover:text-primary transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link to="/integrations" className="hover:text-primary transition-colors">
                                    Integrations
                                </Link>
                            </li>
                            <li>
                                <Link to="/enterprise" className="hover:text-primary transition-colors">
                                    Enterprise
                                </Link>
                            </li>
                            <li>
                                <Link to="/changelog" className="hover:text-primary transition-colors">
                                    Changelog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link to="/docs" className="hover:text-primary transition-colors">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="hover:text-primary transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link to="/community" className="hover:text-primary transition-colors">
                                    Community
                                </Link>
                            </li>
                            <li>
                                <Link to="/help" className="hover:text-primary transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/api" className="hover:text-primary transition-colors">
                                    API Reference
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Stay updated</h3>
                        <p className="text-muted-foreground text-sm">
                            Subscribe to our newsletter for the latest AI trends and product updates.
                        </p>
                        <div className="flex flex-col gap-2">
                            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-background"
                                />
                                <Button type="submit" size="icon" className="shrink-0">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </form>
                            <p className="text-[10px] text-muted-foreground">
                                We respect your privacy. Unsubscribe at any time.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} AutoModel Builder. All rights reserved.
                    </p>

                    {/* Legal Links (hidden on mobile, shown on md+) */}
                    <div className="flex gap-6 text-xs text-muted-foreground">
                        <Link to="/privacy" className="hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/cookies" className="hover:text-foreground transition-colors">
                            Cookie Settings
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Github className="h-4 w-4" />
                            <span className="sr-only">GitHub</span>
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Twitter className="h-4 w-4" />
                            <span className="sr-only">Twitter</span>
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Linkedin className="h-4 w-4" />
                            <span className="sr-only">LinkedIn</span>
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Instagram className="h-4 w-4" />
                            <span className="sr-only">Instagram</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

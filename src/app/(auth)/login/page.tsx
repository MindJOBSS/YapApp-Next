"use client"
import { MessageSquare, Mail, Lock, Eye } from "lucide-react";
import Link from "next/link";
import AuthImagePattern from "@/components/AuthImagePattern";
import GoogleButton from "@/components/GoogleButton";
import { loginCredentials } from "@/lib/server-action";
import { useActionState } from "react";
import toast from "react-hot-toast";


const LoginPage = () => {

    const [error , action , isPending ] = useActionState(loginCredentials,null)

    if (error?.error) {
        toast.error(error.error)
    }

    if (error?.success) {
        toast.success(error.success)
    }

    return (
        <div className="h-screen grid lg:grid-cols-2">
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
                            <p className="text-base-content/60">Sign in to your account</p>
                        </div>
                    </div>

                    <form action={action} className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Email</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-base-content/40" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    className="input input-bordered w-full pl-10"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Password</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-base-content/40" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    className="input input-bordered w-full pl-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    aria-label="Show password"
                                    title="Show password"
                                >
                                    <Eye className="h-5 w-5 text-base-content/40" />
                                </button>
                            </div>
                        </div>

                        <button disabled={isPending} type="submit" className="btn btn-primary w-full">
                            {isPending ? null : "Sign in"}
                            {isPending && (<span className="loading loading-spinner loading-sm"></span>)}
                        </button>
                        <GoogleButton/>
                    </form>

                    <div className="text-center">
                        <p className="text-base-content/60">
                            Don&apos;t have an account?{" "}
                            <Link href="/sign" className="link link-primary">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <AuthImagePattern
                title="Welcome back!"
                subtitle="Sign in to continue your conversations and catch up with your messages."
            />
        </div>
    );
};

export default LoginPage;

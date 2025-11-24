import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function SignUpPage() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const isSignUpButtonDisabled =
    isLoading ||
    !acceptedPrivacyPolicy ||
    !acceptedTerms ||
    !name ||
    !email ||
    !password;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);

    // Validate consent
    if (!acceptedPrivacyPolicy || !acceptedTerms) {
      setError(
        "You must accept the Privacy Policy and Terms of Service to create an account"
      );
      return;
    }

    setIsLoading(true);

    try {
      await register({ email, password, name });
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center flex-1">
      <div className="w-full max-w-md border rounded-2xl p-6 flex flex-col">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Welcome to</p>
          <h1 className="text-xl font-bold">PurpleGlass</h1>
        </div>

        <h2 className="text-lg font-semibold mb-4">Create your account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="privacy-policy"
                checked={acceptedPrivacyPolicy}
                onCheckedChange={(checked) =>
                  setAcceptedPrivacyPolicy(checked === true)
                }
                disabled={isLoading}
                required
              />
              <label
                htmlFor="privacy-policy"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms-of-service"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
                disabled={isLoading}
                required
              />
              <label
                htmlFor="terms-of-service"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link
                  to="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </Link>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSignUpButtonDisabled}
            className="w-full"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

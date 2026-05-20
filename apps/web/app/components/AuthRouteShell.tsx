import AuthFrozenBackdrop from "./AuthFrozenBackdrop";
import AuthModalShell from "./AuthModalShell";
import HomePageContent from "./HomePageContent";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

type AuthMode = "sign-in" | "sign-up";

type Props = {
  mode: AuthMode;
};

export default async function AuthRouteShell({ mode }: Props) {
  return (
    <div className="auth-route">
      <AuthFrozenBackdrop>
        <SiteHeader />
        <HomePageContent />
        <SiteFooter />
      </AuthFrozenBackdrop>
      <AuthModalShell mode={mode} />
    </div>
  );
}

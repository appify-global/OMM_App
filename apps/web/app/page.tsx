import HomePageContent from "./components/HomePageContent";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

export default async function HomePage() {
  return (
    <>
      <SiteHeader />
      <HomePageContent />
      <SiteFooter />
    </>
  );
}

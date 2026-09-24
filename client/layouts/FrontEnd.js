import Header from "@/components/frontend/Header";
import Footer from "@/components/frontend/Footer";

const FrontEnd = ({ children }) => {
  return (
    <div className="marble-frontend">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default FrontEnd;

import FrontEnd from "@/layouts/FrontEnd";

export default function FrontendLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/frontend.css" />
      <FrontEnd>{children}</FrontEnd>
    </>
  );
}

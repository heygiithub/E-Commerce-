import CustomerNavbar from "../componants/CustomerNavbar";

export default function CustomerLayout({ children}) {
    return (
        <div className="min-h-screen bg-gray-100">
            <CustomerNavbar/>
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}
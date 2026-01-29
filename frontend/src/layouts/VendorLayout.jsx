import VendorNavbar from "../componants/VendorNavbar";

export default function VendorLayout({children}) {
    return (
        <div className="min-h-screen bg-gray-100">
            
            <VendorNavbar/>

            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>  
    );
}
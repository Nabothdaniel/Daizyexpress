import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { motion } from 'framer-motion';
import Sidebar from '../../Components/Sidebar';
import Top from '../../Components/Top';
import ServiceForm from '../../Components/DashboardUser/PaymentForm';
import BookingDetailsForm from '../../Components/DashboardUser/BookingDetailsForm';
import UploadForm from '../../Components/DashboardUser/UploadForm';
import { useAuth } from '../../Context/useContext';

const UploadPage = () => {
  const { token } = useAuth(); 
  const [currentView, setCurrentView] = useState<'services' | 'booking' | 'upload'>('services');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]); 
  const [totalPrice, setTotalPrice] = useState<number>(0); 
  const API_BASE_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://daizyexserver.vercel.app';

  const fetchActivePayment = async () => {
    setLoading(true); 
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/active-payments`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const { activePlan } = await response.json();
        if (activePlan) {
          setCurrentView('upload');
        }
      } else {
        console.error('Failed to fetch payment data.');
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false); // Ensure loading stops after the fetch
    }
  };

  useEffect(() => {
    if (token) {
      fetchActivePayment();
    }
  }, [token]); 

  const handleProceedToBooking = (service: string | null, addOns: string[], price: number) => {
    setSelectedService(service);
    setSelectedAddOns(addOns);
    setTotalPrice(price);
    setCurrentView('booking');
  };

  const handleBackToServices = () => {
    setCurrentView('services');
  };

  const handleProceedToUpload = () => {
    setCurrentView('upload');
  };

  return (
    <>
      <Top isAdmin={false} />
      <div className="flex">
        <Sidebar isAdmin={false} />
        <div style={{ flex: 1, position: 'relative', padding: '20px' }}>
          {loading && (
            <div className='loading-mechanism'>
              <Spin tip="Loading..." size="large" />
            </div>
          )}
          {!loading && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'services' && (
                <ServiceForm
                  onProceed={(addOns, service, price) => handleProceedToBooking(service, addOns, price)}
                />
              )}
              {currentView === 'booking' && (
                <BookingDetailsForm
                  onBack={handleBackToServices}
                  onProceed={handleProceedToUpload}
                  selectedAddOns={selectedAddOns}
                  totalPrice={totalPrice}
                  selectedService={selectedService}
                />
              )}
              {currentView === 'upload' && <UploadForm onfetchActivePayment={fetchActivePayment} />}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadPage;


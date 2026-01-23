import { useEffect, useState } from "react";
import apiClient from "../services/api";
import { toast } from "react-toastify";
import { HeaderPart } from "../components";
import { useNavigate } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";

export interface PaymentType {
  id: number;
  card_number_last4: string;
  card_holder_name: string;
  expiry_month: number;
  expiry_year: number;
  balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Payment = () => {
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate()

  // Yangi karta form state
  const [newCard, setNewCard] = useState({
    card_number: "",
    card_holder_name: "",
    expiry_month: "",
    expiry_year: "",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = () => {
    setLoading(true);

    apiClient
      .get("/api/payment/cards/")
      .then((res) => {
        const resultData = res.data?.result;

        if (Array.isArray(resultData)) {
          setPayments(resultData);
        } else {
          setPayments([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching cards:", err);
        setPayments([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Karta raqamini formatlash
  const formatCardNumber = (last4: string) => {
    if (!last4) return "•••• •••• •••• ••••";
    return `•••• •••• •••• ${last4}`;
  };

  // Amal qilish muddatini formatlash
  const formatExpiryDate = (month: number, year: number) => {
    if (!month || !year) return "••/••";
    const formattedMonth = month < 10 ? `0${month}` : month;
    const yearStr = year.toString();
    const lastTwoDigits = yearStr.length >= 2 ? yearStr.slice(-2) : yearStr;
    return `${formattedMonth}/${lastTwoDigits}`;
  };

  // Balansni formatlash
  const formatBalance = (balance: string) => {
    if (!balance) return "0.00";
    try {
      const numBalance = parseFloat(balance);
      if (isNaN(numBalance)) return "0.00";
      return numBalance.toLocaleString("uz-UZ", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return "0.00";
    }
  };

  // Karta turini aniqlash (birinchi raqam bo'yicha)
  const getCardType = (cardNumber: string) => {
    if (!cardNumber) return "Bank";

    // To'liq karta raqami bo'lsa
    const firstDigit = cardNumber.charAt(0);

    switch (firstDigit) {
      case "4":
        return "Visa";
      case "5":
        return "Mastercard";
      case "3":
        return "American Express";
      case "6":
        // Uzcard/Humo - Uzcard 8600 bilan boshlanadi, Humo 9860
        if (cardNumber.startsWith("8600")) return "Uzcard";
        if (cardNumber.startsWith("9860")) return "Humo";
        return "Discover";
      default:
        return "Bank";
    }
  };

  // Karta rangini aniqlash
  const getCardColor = (cardType: string) => {
    const type = cardType.toLowerCase();
    if (type.includes("visa")) {
      return "from-green-500 to-green-600";
    } else if (type.includes("mastercard")) {
      return "from-red-500 to-orange-500";
    } else if (type.includes("uzcard")) {
      return "from-green-500 to-emerald-600";
    } else if (type.includes("humo")) {
      return "from-gray-700 to-gray-900";
    } else {
      return "from-indigo-500 to-green-600";
    }
  };

  // Karta statusini o'zgartirish
  const handleUpdateStatus = (cardId: number, currentStatus: boolean) => {
    if (!selectedCard) return;
    apiClient
      .patch(`/api/payment/cards/${cardId}/update_status/`)
      .then((res) => {
        console.log(res.data);

        toast.success(
          currentStatus
            ? "Karta muvaffaqiyatli faolsizlashtirildi"
            : "Karta muvaffaqiyatli faollashtirildi"
        );

        // Kartalar ro'yxatini yangilash
        setPayments((prev) =>
          prev.map((card) =>
            card.id === cardId ? { ...card, is_active: !currentStatus } : card
          )
        );

        setShowStatusModal(false);
        setSelectedCard(null);
      })
      .catch((err) => {
        console.log(err);

        console.error("Error updating card status:", err);
        toast.error("Karta holatini o'zgartirishda xatolik");
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  // Karta o'chirish
  const handleDeleteCard = (cardId: number) => {
    if (!selectedCard) return;

    setIsProcessing(true);

    apiClient
      .delete(`/api/payment/cards/${cardId}/delete/`)
      .then((res) => {
        if (res.data.success) {
          const newPayment = payments.filter((item) => item.id !== cardId);
          setPayments(newPayment);
          toast.success("Karta muvaffaqiyatli o'chirildi");
        } else {
          toast.error(res.data.error.message);
        }

        setShowDeleteModal(false);
        setSelectedCard(null);
      })
      .catch((err) => {
        console.error("Error deleting card:", err);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  // Yangi karta qo'shish
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newCard.card_number ||
      !newCard.card_holder_name ||
      !newCard.expiry_month ||
      !newCard.expiry_year
    ) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    setIsProcessing(true);

    apiClient
      .post("/api/payment/cards/add/", {
        card_number: newCard.card_number.replace(/\s/g, ""),
        card_holder_name: newCard.card_holder_name,
        expiry_month: parseInt(newCard.expiry_month),
        expiry_year: parseInt(newCard.expiry_year),
      })
      .then(() => {
        toast.success("Karta muvaffaqiyatli qo'shildi");
        setShowAddCardModal(false);
        setNewCard({
          card_number: "",
          card_holder_name: "",
          expiry_month: "",
          expiry_year: "",
        });
        fetchPayments(); // Yangi ro'yxatni olish
      })
      .catch((err) => {
        console.error("Error adding card:", err);
        toast.error("Karta qo'shishda xatolik");
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  // Karta raqamini formatlash (input uchun)
  const formatCardNumberInput = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  // Loading holati
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Mening Kartalarim
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-linear-to-r from-gray-300 to-gray-200 rounded-3xl p-6 shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeaderPart />
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
            <button className="flex items-center gap-3 my-4 cursor-pointer bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 py-2 px-3" onClick={() =>navigate(-1)}>
             <ArrowLeftOutlined/>
              <span>Ortga qaytish</span>
            </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Mening Kartalarim
              </h1>
              <p className="text-gray-600 mt-2">
                Barcha qo'shilgan bank kartalaringiz
              </p>
            </div>
            <button
              onClick={() => setShowAddCardModal(true)}
              className="mt-4 md:mt-0 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Yangi Karta Qo'shish
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Jami Balans</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {payments
                      .reduce(
                        (sum, card) => sum + (parseFloat(card.balance) || 0),
                        0
                      )
                      .toLocaleString("uz-UZ", {
                        minimumFractionDigits: 2,
                      })}{" "}
                    UZS
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Faol Kartalar</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {payments.filter((card) => card?.is_active).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Jami Kartalar</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {payments.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {!payments || payments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-linear-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  Kartalar Topilmadi
                </h3>
                <p className="text-gray-600 mb-8">
                  Hozircha hech qanday bank kartasi qo'shilmagan. Yangi karta
                  qo'shish uchun quyidagi tugmani bosing.
                </p>
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className="px-8 py-3 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                >
                  Birinchi Kartani Qo'shish
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payments.map((card) => {
                if (!card) return null;

                const cardType = getCardType("4" + card.card_number_last4); 
                const gradientClass = getCardColor(cardType);

                return (
                  <div key={card.id} className="group">
                    {/* Bitta kartada barchasi */}
                    <div
                      className={`relative bg-linear-to-br ${gradientClass} rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 min-h-[280px] border-2 border-white/20 flex flex-col justify-between`}
                    >
                      {/* Yuqori qism: Chip, Logo va Card Number */}
                      <div className="flex justify-between items-start">
                        {/* Card Logo */}
                        <div className="text-white font-bold text-lg tracking-wider bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                          {cardType.toUpperCase()}
                        </div>

                        {/* Chip */}
                        <div className="w-12 h-9 bg-linear-to-r from-yellow-400 to-yellow-300 rounded-lg flex items-center justify-center shadow-md">
                          <div className="grid grid-cols-2 gap-1">
                            {[...Array(8)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 h-1 bg-black rounded-full"
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Number */}
                      <div className="text-center mt-6">
                        <div className="text-white text-2xl tracking-[0.2em] font-semibold drop-shadow-lg">
                          {formatCardNumber(card.card_number_last4)}
                        </div>
                      </div>

                      {/* O'rta qism: Balans paneli */}
                      <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-200 text-sm mb-1">Balans</p>
                            <p className="text-white text-2xl font-bold">
                              {formatBalance(card.balance)} UZS
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full ${
                              card.is_active
                                ? "bg-green-500/30 text-green-200"
                                : "bg-red-500/30 text-red-200"
                            } text-sm font-medium`}
                          >
                            {card.is_active ? "Faol" : "Nofaol"}
                          </div>
                        </div>
                      </div>

                      {/* Pastki qism: Card Holder, Expiry va Action Buttons */}
                      <div className="mt-6">
                        {/* Card Holder and Expiry */}
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-gray-200/80 text-xs uppercase tracking-wider mb-1">
                              Karta egasi
                            </p>
                            <p className="text-white text-lg font-semibold tracking-wider">
                              {(
                                card.card_holder_name || "NOMA'LUM"
                              ).toUpperCase()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-200/80 text-xs uppercase tracking-wider mb-1">
                              Amal qilish muddati
                            </p>
                            <p className="text-white text-lg font-semibold tracking-wider">
                              {formatExpiryDate(
                                card.expiry_month,
                                card.expiry_year
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons - Pastki qismda */}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setShowStatusModal(true);
                            }}
                            className="flex-1 px-4 py-3 bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/40 transition-all duration-200 text-sm flex items-center justify-center space-x-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={
                                  card.is_active
                                    ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                }
                              />
                            </svg>
                            <span>
                              {card.is_active
                                ? "Faolsizlashtirish"
                                : "Faollashtirish"}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setShowDeleteModal(true);
                            }}
                            className="px-4 py-3 bg-red-400/70 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-red-500/70 transition-all duration-200 text-sm flex items-center justify-center"
                            title="Kartani o'chirish"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Card Modal */}
        {showAddCardModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50  flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Yangi Karta Qo'shish
                </h2>
                <button
                  onClick={() => setShowAddCardModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddCard}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Karta Raqami <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCard.card_number}
                      onChange={(e) =>
                        setNewCard({
                          ...newCard,
                          card_number: formatCardNumberInput(e.target.value),
                        })
                      }
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Karta Egasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCard.card_holder_name}
                      onChange={(e) =>
                        setNewCard({
                          ...newCard,
                          card_holder_name: e.target.value,
                        })
                      }
                      placeholder="ALI VALIYEV"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none uppercase"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Oy (MM) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newCard.expiry_month}
                        onChange={(e) =>
                          setNewCard({
                            ...newCard,
                            expiry_month: e.target.value,
                          })
                        }
                        placeholder="12"
                        min="1"
                        max="12"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yil (YYYY) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newCard.expiry_year}
                        onChange={(e) =>
                          setNewCard({
                            ...newCard,
                            expiry_year: e.target.value,
                          })
                        }
                        placeholder="2026"
                        min={new Date().getFullYear()}
                        max={new Date().getFullYear() + 20}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                    disabled={isProcessing}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Qo'shilmoqda..." : "Qo'shish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedCard && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    selectedCard.is_active ? "bg-red-100" : "bg-green-100"
                  } mb-4`}
                >
                  <svg
                    className={`w-8 h-8 ${
                      selectedCard.is_active ? "text-red-600" : "text-green-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedCard.is_active
                    ? "Kartani faolsizlashtirish?"
                    : "Kartani faollashtirish?"}
                </h2>
                <p className="text-gray-600">
                  {selectedCard.is_active
                    ? "Agar siz bu kartani faolsizlashtirsangiz, u bilan bog'liq barcha faol e'lonlar ham faolsizlashtiriladi. Bu amalni teskari qilib bo'lmaydi."
                    : "Bu kartani faollashtirishga ishonchingiz komilmi?"}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedCard(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  disabled={isProcessing}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedCard.id, selectedCard.is_active)
                  }
                  className={`flex-1 px-4 py-3 ${
                    selectedCard.is_active
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white font-medium rounded-xl transition-all disabled:opacity-50`}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Kutilmoqda..."
                    : selectedCard.is_active
                    ? "Faolsizlashtirish"
                    : "Faollashtirish"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Card Modal */}
        {showDeleteModal && selectedCard && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Kartani o'chirish?
                </h2>
                <p className="text-gray-600">
                  Ushbu kartani o'chirishga ishonchingiz komilmi? Agar bu karta
                  bilan bog'liq faol e'lonlar bo'lsa, ular ham o'chiriladi. Bu
                  amalni teskari qilib bo'lmaydi.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCard(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  disabled={isProcessing}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => handleDeleteCard(selectedCard.id)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Payment;

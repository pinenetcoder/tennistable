import { ref, computed } from 'vue'

const STORAGE_KEY = 'app-locale'
const DEFAULT_LOCALE = 'en'

const locale = ref(localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCALE)

const messages = {
  en: {
    // Courts
    courtPrefix: 'Court',

    // NavBar
    brandName: 'Tennis TimeTable',
    userMenu: 'User menu',
    bookACourt: 'Book a Court',
    myBookings: 'My Bookings',
    signOut: 'Sign Out',
    signIn: 'Sign In',

    // Bottom tabs
    tabBook: 'Book',
    tabTimetable: 'Timetable',
    tabProfile: 'Profile',
    mainNav: 'Main navigation',

    // Login
    loginSubtitle: 'Sign in to book courts and manage your reservations',
    signInFailed: 'Sign in failed. Please try again.',
    signInWithGoogle: 'Sign in with Google',
    signInWithEmail: 'Sign in with Email',
    signingIn: 'Signing in...',
    or: 'or',
    firstNamePlaceholder: 'First Name',
    lastNamePlaceholder: 'Last Name',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    signUp: 'Sign Up',
    signInBtn: 'Sign In',
    alreadyHaveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    checkEmail: 'Check your email to confirm registration.',

    // Dashboard stepper
    viewFullTimetable: 'View Full Timetable',
    back: 'Back',
    pickADate: 'Pick a Date',
    whenPlay: 'When do you want to play?',
    startTime: 'Start Time',
    howLong: 'How Long?',
    startingAt: 'Starting at',
    pickACourt: 'Pick a Court',
    confirmBooking: 'Confirm Booking',
    reviewReservation: 'Review your reservation',
    date: 'Date',
    time: 'Time',
    court: 'Court',
    bookingInProgress: 'Booking...',
    bookingFailed: 'Booking failed. Please try again.',
    booked: 'Booked!',
    courtReserved: 'Your court is reserved',
    bookAnother: 'Book Another',
    noSlotsForDate: 'No available slots for this date',
    pickAnotherDate: 'Pick another date',
    noDurations: 'No durations available at this time',
    pickAnotherTime: 'Pick another time',

    // Duration formatting
    min: 'min',
    hour: 'hour',
    hours: 'hours',

    // Timetable
    quickBook: 'Quick Book',
    timetable: 'Timetable',
    clickSlotHint: 'Click a slot to start, click another below to extend',
    available: 'Available',
    cancel: 'Cancel',
    bookNow: 'Book Now',

    // Profile
    upcoming: 'Upcoming',
    upcomingReservations: 'Upcoming Reservations',
    history: 'History',
    noUpcoming: 'No upcoming reservations',
    noPast: 'No past reservations',
    cancelBookingConfirm: 'Cancel this booking?',
    active: 'active',
    cancelled: 'cancelled',

    // Court view
    allCourts: 'All Courts',
    day: 'Day',
    week: 'Week',
    today: 'Today',
    free: 'Free',

    // Booking modal
    closeDialog: 'Close dialog',

    // Date picker
    previousDay: 'Previous day',
    nextDay: 'Next day',

    // Slot cell
    pastTimeSlot: 'Past time slot',
    availableClickToBook: 'Available — click to book',
    yourBookingClickCancel: 'Your booking — click to cancel',
    bookedBy: 'Booked by',
    myBooking: 'My Booking',
  },

  ru: {
    courtPrefix: 'Корт',

    brandName: 'Tennis TimeTable',
    userMenu: 'Меню пользователя',
    bookACourt: 'Забронировать корт',
    myBookings: 'Мои брони',
    signOut: 'Выйти',
    signIn: 'Войти',

    tabBook: 'Бронь',
    tabTimetable: 'Расписание',
    tabProfile: 'Профиль',
    mainNav: 'Основная навигация',

    loginSubtitle: 'Войдите, чтобы бронировать корты и управлять резервациями',
    signInFailed: 'Не удалось войти. Попробуйте ещё раз.',
    signInWithGoogle: 'Войти через Google',
    signInWithEmail: 'Войти через Email',
    signingIn: 'Входим...',
    or: 'или',
    firstNamePlaceholder: 'Имя',
    lastNamePlaceholder: 'Фамилия',
    emailPlaceholder: 'Электронная почта',
    passwordPlaceholder: 'Пароль',
    signUp: 'Регистрация',
    signInBtn: 'Войти',
    alreadyHaveAccount: 'Уже есть аккаунт?',
    noAccount: 'Нет аккаунта?',
    checkEmail: 'Проверьте почту для подтверждения регистрации.',

    viewFullTimetable: 'Полное расписание',
    back: 'Назад',
    pickADate: 'Выберите дату',
    whenPlay: 'Когда хотите играть?',
    startTime: 'Время начала',
    howLong: 'Как долго?',
    startingAt: 'Начало в',
    pickACourt: 'Выберите корт',
    confirmBooking: 'Подтвердить бронь',
    reviewReservation: 'Проверьте бронирование',
    date: 'Дата',
    time: 'Время',
    court: 'Корт',
    bookingInProgress: 'Бронирование...',
    bookingFailed: 'Не удалось забронировать. Попробуйте ещё раз.',
    booked: 'Забронировано!',
    courtReserved: 'Корт забронирован',
    bookAnother: 'Забронировать ещё',
    noSlotsForDate: 'Нет доступных слотов на эту дату',
    pickAnotherDate: 'Выбрать другую дату',
    noDurations: 'Нет доступной длительности на это время',
    pickAnotherTime: 'Выбрать другое время',

    min: 'мин',
    hour: 'час',
    hours: 'часов',

    quickBook: 'Быстрая бронь',
    timetable: 'Расписание',
    clickSlotHint: 'Нажмите на слот, чтобы начать, нажмите на другой ниже, чтобы продлить',
    available: 'Свободно',
    cancel: 'Отмена',
    bookNow: 'Забронировать',

    upcoming: 'Предстоящие',
    upcomingReservations: 'Предстоящие бронирования',
    history: 'История',
    noUpcoming: 'Нет предстоящих бронирований',
    noPast: 'Нет прошлых бронирований',
    cancelBookingConfirm: 'Отменить бронирование?',
    active: 'активна',
    cancelled: 'отменена',

    allCourts: 'Все корты',
    day: 'День',
    week: 'Неделя',
    today: 'Сегодня',
    free: 'Свободно',

    closeDialog: 'Закрыть',

    previousDay: 'Предыдущий день',
    nextDay: 'Следующий день',

    pastTimeSlot: 'Прошедший слот',
    availableClickToBook: 'Свободно — нажмите для бронирования',
    yourBookingClickCancel: 'Ваша бронь — нажмите для отмены',
    bookedBy: 'Забронировано',
    myBooking: 'Моя бронь',
  },

  lt: {
    courtPrefix: 'Kortas',

    brandName: 'Tennis TimeTable',
    userMenu: 'Vartotojo meniu',
    bookACourt: 'Rezervuoti kortą',
    myBookings: 'Mano rezervacijos',
    signOut: 'Atsijungti',
    signIn: 'Prisijungti',

    tabBook: 'Rezervuoti',
    tabTimetable: 'Tvarkaraštis',
    tabProfile: 'Profilis',
    mainNav: 'Pagrindinė navigacija',

    loginSubtitle: 'Prisijunkite, kad galėtumėte rezervuoti kortus ir valdyti rezervacijas',
    signInFailed: 'Prisijungti nepavyko. Bandykite dar kartą.',
    signInWithGoogle: 'Prisijungti su Google',
    signInWithEmail: 'Prisijungti el. paštu',
    signingIn: 'Jungiamasi...',
    or: 'arba',
    firstNamePlaceholder: 'Vardas',
    lastNamePlaceholder: 'Pavardė',
    emailPlaceholder: 'El. paštas',
    passwordPlaceholder: 'Slaptažodis',
    signUp: 'Registracija',
    signInBtn: 'Prisijungti',
    alreadyHaveAccount: 'Jau turite paskyrą?',
    noAccount: 'Neturite paskyros?',
    checkEmail: 'Patikrinkite el. paštą, kad patvirtintumėte registraciją.',

    viewFullTimetable: 'Pilnas tvarkaraštis',
    back: 'Atgal',
    pickADate: 'Pasirinkite datą',
    whenPlay: 'Kada norite žaisti?',
    startTime: 'Pradžios laikas',
    howLong: 'Kiek laiko?',
    startingAt: 'Pradžia',
    pickACourt: 'Pasirinkite kortą',
    confirmBooking: 'Patvirtinti rezervaciją',
    reviewReservation: 'Peržiūrėkite rezervaciją',
    date: 'Data',
    time: 'Laikas',
    court: 'Kortas',
    bookingInProgress: 'Rezervuojama...',
    bookingFailed: 'Rezervacija nepavyko. Bandykite dar kartą.',
    booked: 'Rezervuota!',
    courtReserved: 'Kortas rezervuotas',
    bookAnother: 'Rezervuoti dar',
    noSlotsForDate: 'Šiai datai nėra laisvų laikų',
    pickAnotherDate: 'Pasirinkti kitą datą',
    noDurations: 'Šiuo metu nėra galimų trukmių',
    pickAnotherTime: 'Pasirinkti kitą laiką',

    min: 'min',
    hour: 'val.',
    hours: 'val.',

    quickBook: 'Greita rezervacija',
    timetable: 'Tvarkaraštis',
    clickSlotHint: 'Paspauskite laiką pradžiai, paspauskite kitą žemiau pratęsti',
    available: 'Laisva',
    cancel: 'Atšaukti',
    bookNow: 'Rezervuoti dabar',

    upcoming: 'Būsimos',
    upcomingReservations: 'Būsimos rezervacijos',
    history: 'Istorija',
    noUpcoming: 'Nėra būsimų rezervacijų',
    noPast: 'Nėra praeities rezervacijų',
    cancelBookingConfirm: 'Atšaukti šią rezervaciją?',
    active: 'aktyvi',
    cancelled: 'atšaukta',

    allCourts: 'Visi kortai',
    day: 'Diena',
    week: 'Savaitė',
    today: 'Šiandien',
    free: 'Laisva',

    closeDialog: 'Uždaryti dialogą',

    previousDay: 'Ankstesnė diena',
    nextDay: 'Kita diena',

    pastTimeSlot: 'Praėjęs laikas',
    availableClickToBook: 'Laisva — paspauskite rezervuoti',
    yourBookingClickCancel: 'Jūsų rezervacija — paspauskite atšaukti',
    bookedBy: 'Rezervavo',
    myBooking: 'Mano rezervacija',
  }
}

const LOCALE_MAP = {
  en: 'en-US',
  ru: 'ru-RU',
  lt: 'lt-LT'
}

export function useI18n() {
  function t(key) {
    return messages[locale.value]?.[key] || messages.en[key] || key
  }

  function setLocale(l) {
    locale.value = l
    localStorage.setItem(STORAGE_KEY, l)
    document.documentElement.lang = l
  }

  const dateLocale = computed(() => LOCALE_MAP[locale.value] || 'en-US')

  function courtName(court) {
    if (!court) return ''
    const num = court.id ?? court.name?.match(/\d+/)?.[0] ?? ''
    return `${t('courtPrefix')} ${num}`
  }

  return {
    t,
    locale,
    setLocale,
    dateLocale,
    courtName,
    locales: ['en', 'ru', 'lt']
  }
}

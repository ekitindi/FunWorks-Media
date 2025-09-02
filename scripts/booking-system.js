// EmailJS Configuration
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'BuaVL8Fc5jtxfZrdY', // Replace with your EmailJS public key
  SERVICE_ID: 'service_xc1ug1n', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'template_dyuxwlo' // Replace with your EmailJS template ID
};

// Initialize EmailJS
(function() {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
})();

class BookingCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookedSlots = new Set();
    
    this.init();
  }

  init() {
    this.renderCalendar();
    this.bindEvents();
    this.loadBookedSlots();
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
      new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });

    // Add calendar days
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = date.getDate();

      if (date.getMonth() !== month) {
        dayElement.classList.add('disabled');
      } else {
        const dayOfWeek = date.getDay();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && date >= today) {
          dayElement.classList.add('available');
          dayElement.dataset.date = date.toISOString().split('T')[0];
        } else {
          dayElement.classList.add('disabled');
        }
      }

      calendarGrid.appendChild(dayElement);
    }
  }

  bindEvents() {
    document.getElementById('prevMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    });

    document.getElementById('calendarGrid').addEventListener('click', (e) => {
      if (e.target.classList.contains('calendar-day') && e.target.classList.contains('available')) {
        this.selectDate(e.target);
      }
    });

    document.getElementById('timeSlots').addEventListener('click', (e) => {
      if (e.target.classList.contains('time-slot') && !e.target.classList.contains('booked')) {
        this.selectTime(e.target);
      }
    });

    document.getElementById('appointmentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitBooking();
    });
  }

  selectDate(dayElement) {
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    dayElement.classList.add('selected');
    this.selectedDate = dayElement.dataset.date;
    
    document.getElementById('timeSlots').style.display = 'block';
    document.getElementById('bookingForm').style.display = 'none';
    
    const dateObj = new Date(this.selectedDate);
    document.getElementById('summaryDate').textContent = 
      dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    this.selectedTime = null;
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('summaryTime').textContent = '-';
  }

  selectTime(timeElement) {
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    timeElement.classList.add('selected');
    this.selectedTime = timeElement.dataset.time;
    
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('summaryTime').textContent = timeElement.textContent;
  }

  loadBookedSlots() {
    // Simulate booked slots - replace with your backend data
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.bookedSlots.add(`${tomorrow.toISOString().split('T')[0]}-10:00`);
    this.bookedSlots.add(`${tomorrow.toISOString().split('T')[0]}-14:00`);
  }

  async submitBooking() {
    const formData = new FormData(document.getElementById('appointmentForm'));
    const bookingData = {
      date: this.selectedDate,
      time: this.selectedTime,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      service: formData.get('service'),
      message: formData.get('message')
    };

    const submitBtn = document.querySelector('#appointmentForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    submitBtn.disabled = true;

    // Hide any existing messages
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    try {
      await this.sendBookingEmail(bookingData);
      
      // Show success message
      document.getElementById('successMessage').style.display = 'block';
      
      // Reset form
      document.getElementById('appointmentForm').reset();
      this.resetSelection();
      
      // Scroll to success message
      document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Booking error:', error);
      document.getElementById('errorMessage').style.display = 'block';
      document.getElementById('errorMessage').scrollIntoView({ behavior: 'smooth' });
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  async sendBookingEmail(bookingData) {
    const templateParams = {
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      service: bookingData.service,
      date: new Date(bookingData.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: bookingData.time,
      message: bookingData.message || 'No additional information provided'
    };

    try {
      // Send email to client
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      // Send notification to consultant (you can create a separate template for this)
      const consultantParams = {
        ...templateParams,
        to_email: 'info@funworksmedia.com',
        subject: `New Appointment Booking - ${bookingData.service}`
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID, // You might want a different template for consultant
        consultantParams
      );

      console.log('Booking emails sent successfully');
      
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  resetSelection() {
    this.selectedDate = null;
    this.selectedTime = null;
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('timeSlots').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('summaryDate').textContent = '-';
    document.getElementById('summaryTime').textContent = '-';
  }
}

// Initialize the booking calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new BookingCalendar();
});
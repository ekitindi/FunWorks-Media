// Google Calendar Integration
// This file handles real-time calendar availability

class GoogleCalendarIntegration {
  constructor() {
    this.calendarId = 'primary'; // or your specific calendar ID
    this.apiKey = 'YOUR_GOOGLE_API_KEY'; // Replace with your actual API key
    this.baseUrl = 'https://www.googleapis.com/calendar/v3';
  }

  /**
   * Fetch availability for a date range
   * @param {Date} startDate - Start date for availability check
   * @param {Date} endDate - End date for availability check
   * @returns {Promise<Map>} Map of date -> Set of booked times
   */
  async fetchAvailability(startDate, endDate) {
    try {
      console.log('Fetching calendar availability...');
      
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      const url = `${this.baseUrl}/calendars/${this.calendarId}/events?` +
        `timeMin=${startDateStr}&timeMax=${endDateStr}&` +
        `key=${this.apiKey}&singleEvents=true&orderBy=startTime`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.processEvents(data.items);
      
    } catch (error) {
      console.error('Error fetching calendar availability:', error);
      // Return empty map if API fails (fallback to local data)
      return new Map();
    }
  }

  /**
   * Process calendar events into booked slots
   * @param {Array} events - Array of calendar events
   * @returns {Map} Map of date -> Set of booked times
   */
  processEvents(events) {
    const bookedSlots = new Map();
    
    events.forEach(event => {
      // Skip all-day events
      if (event.start.date) return;
      
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      
      // Only process events during business hours (10 AM - 4 PM)
      const startHour = start.getHours();
      const endHour = end.getHours();
      
      if (startHour >= 10 && startHour <= 16) {
        const dateString = start.toISOString().split('T')[0];
        const timeString = start.toTimeString().substring(0, 5);
        
        if (!bookedSlots.has(dateString)) {
          bookedSlots.set(dateString, new Set());
        }
        bookedSlots.get(dateString).add(timeString);
      }
    });
    
    console.log('Processed calendar events:', bookedSlots);
    return bookedSlots;
  }

  /**
   * Add a new booking to the calendar
   * @param {Object} bookingData - Booking information
   * @returns {Promise<boolean>} Success status
   */
  async addBookingToCalendar(bookingData) {
    try {
      const startDateTime = `${bookingData.date}T${bookingData.time}:00`;
      const endDateTime = `${bookingData.date}T${this.getEndTime(bookingData.time)}:00`;
      
      const event = {
        summary: `Consultation - ${bookingData.service}`,
        description: `Consultation with ${bookingData.name}\n\nService: ${bookingData.service}\nPhone: ${bookingData.phone}\nEmail: ${bookingData.email}${bookingData.message ? `\n\nAdditional Information:\n${bookingData.message}` : ''}`,
        start: {
          dateTime: startDateTime,
          timeZone: 'Africa/Nairobi'
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Africa/Nairobi'
        },
        attendees: [
          { email: bookingData.email, displayName: bookingData.name },
          { email: 'info@funworksmedia.com', displayName: 'FunWorks Media Consulting' }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      };

      const response = await fetch(`${this.baseUrl}/calendars/${this.calendarId}/events?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Failed to add booking to calendar: ${response.status}`);
      }

      const result = await response.json();
      console.log('Booking added to calendar:', result);
      return true;
      
    } catch (error) {
      console.error('Error adding booking to calendar:', error);
      return false;
    }
  }

  /**
   * Get end time for a given start time
   * @param {string} startTime - Start time in HH:MM format
   * @returns {string} End time in HH:MM format
   */
  getEndTime(startTime) {
    const timeMap = {
      '10:00': '11:00',
      '11:00': '12:00',
      '12:00': '13:00',
      '13:00': '14:00',
      '14:00': '15:00',
      '15:00': '16:00',
      '16:00': '17:00'
    };
    return timeMap[startTime] || '11:00';
  }

  /**
   * Check if a specific date/time is available
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} time - Time in HH:MM format
   * @returns {Promise<boolean>} Availability status
   */
  async isTimeSlotAvailable(date, time) {
    try {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      const bookedSlots = await this.fetchAvailability(startDate, endDate);
      const dateBookings = bookedSlots.get(date) || new Set();
      
      return !dateBookings.has(time);
      
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return true; // Assume available if check fails
    }
  }

  /**
   * Get available time slots for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of available time slots
   */
  async getAvailableTimeSlots(date) {
    const allTimeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    const availableSlots = [];
    
    for (const time of allTimeSlots) {
      const isAvailable = await this.isTimeSlotAvailable(date, time);
      if (isAvailable) {
        availableSlots.push(time);
      }
    }
    
    return availableSlots;
  }
}

// Export for use in other files
window.GoogleCalendarIntegration = GoogleCalendarIntegration;

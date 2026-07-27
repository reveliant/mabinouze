import {DateTime} from 'luxon';

export default {
    props: {
        date: String,
    },
    computed: {
        day: function() {
            let now = DateTime.now()
            let day = DateTime.fromISO(this.date);
            
            // Same day
            if (day.hasSame(now, 'day'))
                return "aujourd'hui"
            
            // Future
            if (day > now) {
                // Same day as tomorrow
                if (day.hasSame(now.plus({ day: 1}), 'day'))
                    return "demain"
                // In the next 7 days
                if (day < now.plus({ day: 7 }))
                    return day.toFormat("cccc 'prochain'")
            }

            // Past
            if (day < now) {
                // Same day as yesterday
                if (day.hasSame(now.minus({ day: 1}), 'day'))
                    return "hier"
                // In the last 7 days
                if (day > now.minus({ day: 7 }))
                    return day.toFormat("cccc 'dernier'")
            }

            // Default display 
            return day.toFormat("cccc d MMM")
        },
        time: function() {
            return DateTime.fromISO(this.date).toFormat('t');
        }
    },
    template: `
        <div class="calendar">
            <span class="calendar-day" v-text="day"></span>
            <span class="calendar-time" v-text="time"></span>
        </div>
    `
}
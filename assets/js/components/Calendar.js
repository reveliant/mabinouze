import moment from 'moment';

export default {
    props: {
        date: String,
    },
    computed: {
        day: function() {
            /*
            let now = moment();
            let time = moment(this.date);
            let day = time.isSame(now, 'date') ? "aujourd'hui" : time.format('dddd');
            */
            let day = moment(this.date).calendar(null, {
                lastDay : '[hier]',
                sameDay : '[aujourd\'hui]',
                nextDay : '[demain]',
                lastWeek : 'dddd [dernier]',
                nextWeek : 'dddd [prochain]',
                sameElse : 'dddd D MMM'
            });
            return day;
        },
        time: function() {
            return moment(this.date).format('LT');
        }
    },
    template: `
        <div class="calendar">
            <span class="calendar-day" v-text="day"></span>
            <span class="calendar-time" v-text="time"></span>
        </div>
    `
}
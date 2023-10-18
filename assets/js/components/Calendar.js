import moment from 'moment';

export default {
    props: {
        date: String,
    },
    data() {
      return {
        day: '',
        time: '',
      }
    },
    mounted() {
        let now = moment();
        let time = moment(this.date);
        this.day = time.isSame(now, 'date') ? "aujourd'hui" : time.format('dddd')
        this.time =  time.format('LT')
        console.log("setup", this.date);
    },
    template: `
        <div class="calendar">
            <span class="calendar-day">{{ day }}</span>
            <span class="calendar-time">{{ time }}</span>
        </div>
    `
}
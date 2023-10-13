window.addEventListener('load', function(){
  const app = Vue.createApp({
    delimiters: ['{', '}'],
    data() {
      return {
        tournee: '',
        details: false,
        description: '',
        heure: '',
      }
    },
    watch: {
      tournee(value){
        // binding this to the data value in the email input
        this.tournee = value;
        this.details = value.match(/^[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}$/);
      }
    },
  }).mount('#creer-tournee');
});
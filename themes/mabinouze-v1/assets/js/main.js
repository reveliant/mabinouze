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
        this.details = value.match(/\S{4,}/);
      }
    },
  }).mount('#creer-tournee');
});
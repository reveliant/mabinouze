export default {
    props: {
        order: String
    },
    data() {
        return {
            name: '',
        }
    },
    methods: {
        newDrink(event) {
            event.preventDefault()
            this.emitter.emit('addToOrder', {drink: this.name, order: this.order});
            this.name = '';
            console.log(this.order)
        }
    },
    template: `
        <li class="list-group-item">
            <form class="d-flex justify-content-between align-items-center" @submit="newDrink">
                <input type="text" class="form-control flex-fill p-0 border-0" placeholder="Autre consommation" required v-model="name" />
                <button class="list-group-item-add visible btn btn-success badge ms-3">+</button>
            </form>
        </li>
    `
}
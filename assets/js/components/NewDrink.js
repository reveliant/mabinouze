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
                <input type="text" class="form-control flex-fill px-0 border-0" placeholder="Autre consommation" name="new-drink" autocomplete="on" required v-model="name" />
                <button class="btn btn-outline-secondary btn-circle ms-2"><i class="bi bi-plus"></i></button>
            </form>
        </li>
    `
}
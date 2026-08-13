export default {
    data() {
      return {
        settings: this.getUserDefaultSettings(),
      }
    },
    methods: {
        save(event) {
            event.preventDefault();
            this.setUserDefaultSettings(this.settings.username, this.settings.password);
            this.emitter.emit('updateUserDefaultSettings');
            bootstrap.Offcanvas.getInstance("#navbar-menu").hide();
        }
    },
    template: `
        <form class="mt-3" role="settings" @submit="save">
            <div class="mb-3">
                <label for="default-username">Prénom, nom, alias...</label>
                <input type="text" class="form-control" id="default-username" autocomplete="section-user given-name nickname" required v-model="settings.username">
                <div class="form-text" id="default-username-help">
                    Ton prénom, nom ou alias, visible uniquement par l'organisateur de la tournée pour savoir à qui distribuer les commandes
                </div>
            </div>
            <div class="mb-3">
                <label for="default-password">Mot de passe</label>
                <input type="password" class="form-control" id="default-password" autocomplete="section-user new-password" required v-model="settings.password">
                <div class="form-text" id="default-password-help">
                    Un mot de passe qui te permettra de modifier ta commande ultérieurement.
                    Si tu le perds, ta tournée tourne au vinaigre !
                </div>
            </div>
            <div class="mb-3">
                <button class="btn btn-primary" type="submit">
                    <i class="bi bi-floppy me-1" aria-hidden="true"></i>
                    Enregistrer
                </button>
            </div>
        </form>
    `
  }
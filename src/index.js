Vue.component('child', {
    template: `
        <div>
            <button v-on:click="emit">Clique me to emit from child component</button>
        </div>
    `,
    methods: {
        emit: function() {
            this.$emit('event_child', 1);
        }
    }
});

const formsData = {
    'formA-nn': {
        label: 'Change: New+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password New",
                name: 'password-new',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'password',
                placeholder: "Password Confirm",
                name: 'password-confirm',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'hidden',
                name: 'username',
                autocomplete: 'username',
                value: 'maxzz',
                'data-ftype': -1
            },
        ]
    },
    'formB-cn': {
        label: 'Change: Cur+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password Current",
                name: 'password-current',
                autocomplete: 'current-password',
                'data-ftype': 0 // old
            },
            {
                type: 'password',
                placeholder: "Password New",
                name: 'password-new',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'hidden',
                name: 'username',
                value: 'maxzz',
                'data-ftype': -1
            },
        ]
    },
    'formC-cnn': {
        label: 'Change Cur+New+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password Current",
                name: 'password-current', // <- always current
                autocomplete: 'current-password',
                'data-ftype': 0 // old
            },
            {
                type: 'password',
                placeholder: "Password New",
                name: 'password-new',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'password',
                placeholder: "Password Confirm",
                name: 'password-confirm',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'hidden',
                name: 'username',
                value: 'maxzz',
                'data-ftype': -1
            },
        ]
    },
};

function setAttrs(el, attrs) {
    Object.keys(attrs).forEach(_ => el.setAttribute(_, attrs[_]));
}

const STORAGE_TESTFORM = 'd16-pchange-test-form';

Vue.component('test-form', {
    template: '#test-template',
    data: function() {
        return {
            formId: '',
            formLabel: '',
            loading: false,

            watching: {
                field_username: '',
                fields: [],

                options: {
                    hasUsername: false,
                    hasLogin: true,
                    fillInvalid: false,
                    showPsws: false,
                },
            },

            fillin: [] // fill-values: 0 - old; 1 - new
        };
    },
    mounted() {
        this.formId = this.$el.dataset['formId'];

        let org = formsData[this.formId];
        org.fields.forEach(_ => !_.value && (_.value = ''));

        this.formLabel = org.label;
        this.watching.fields = org.fields;
        this.fillin = org.fields.map(_ => _['data-ftype']);

        this.loading = true;
        this.localStorageLoad();
    },
    watch: {
        watching: {
            handler(value) {
                if (this.loading) {
                    this.loading = false;
                } else {
                    this.localStorageSave();
                }
            },
            deep: true
        }
    },
    methods: {
        localStorageLoad() {
            let cnt = localStorage.getItem(`${STORAGE_TESTFORM}-${this.formId}`);
            let s = cnt && JSON.parse(cnt);
            if (s) {
                this.watching.field_username = s.field_username;
                this.watching.fields.map((_, index) => _.value = s.fields[index]),
                this.watching.options = s.options;
            }
        },
        localStorageSave() {
            let s = {
                field_username: this.watching.field_username,
                fields: this.watching.fields.map(_ => _.value),
                options: this.watching.options,
            };
            localStorage.setItem(`${STORAGE_TESTFORM}-${this.formId}`, JSON.stringify(s));
        },
        fillValues() {
            this.watching.fields.forEach((_, index) => this.fillin[index] >= 0 && (_.value = `____ ${this.fillin[index] + (this.watching.options.fillInvalid ? index : 0)} ____`));
        },
        clearValues() {
            this.watching.fields.forEach((_, index) => this.fillin[index] >= 0 && (_.value = ''));
        },
        fieldType(field) {
            return field.type === 'hidden' ? 'hidden' : this.watching.options.showPsws ? 'text' : field.type;
        },
    },
});

const STORAGE_CURRENT = 'd16-pchange-data';
const STORAGE_VAULT = 'd16-pchange-vault';

Vue.component('hidden-data-form', {
    template: '#hidden-data-form',
    data: () => {
        return {
            lastIndex: 10,
            loadingLocalStorage: false,
            fields: [],
            vault: [],
        };
    },
    created() {
        this.loadLocalStorage();
        this.loadVault();
    },
    methods: {
        /* Fields */
        parseFieldsFromString(cnt) {
            try {
                cnt = cnt && JSON.parse(cnt) || [];
            } catch(err) {
                cnt = [];
            }
            cnt.forEach(_ => _.idx = this.lastIndex++);
            return cnt;
        },
        loadLocalStorage() {
            this.loadingLocalStorage = true;
            let cnt = localStorage.getItem(STORAGE_CURRENT);
            this.fields = this.parseFieldsFromString(cnt);
        },
        saveFieldsToLocalStorage() {
            let cnt = JSON.stringify(this.fields);
            localStorage.setItem(STORAGE_CURRENT, cnt);
        },
        onAddField() {
            this.fields.push({
                value: `data ${this.lastIndex}`,
                password: false,
                idx: this.lastIndex++,
            });
        },
        onDelField(idx) {
            let newFields = this.fields.filter(_ => _.idx != idx);
            this.fields = newFields; 
        },
        /* Vault */
        loadVault() {
            let vault = localStorage.getItem(STORAGE_VAULT);
            vault = JSON.parse(vault || '[]');
            vault.forEach(_ => _.idx = this.lastIndex++);
            this.vault = vault;
        },
        vaultItemDispText(vaultItem) {
            let cnt = JSON.parse(vaultItem || '[]');
            return cnt.reduce((acc, _) => acc += `${_.value}${_.password?'***':''} `, '');
        },
        onAddToVault() {
            this.vault = [{
                data: JSON.stringify(this.fields),
                idx: this.lastIndex++,
            }, ...this.vault];
            localStorage.setItem(STORAGE_VAULT, JSON.stringify(this.vault));
        },
        onDelFromVault(idx) {
            this.vault = this.vault.filter(_ => _.idx !== idx);
        },
        onSetFieldsFromVault(data) {
            this.fields = this.parseFieldsFromString(data);
        },
    },
    watch: {
        fields: {
            handler(val, old) {
                if (this.loadingLocalStorage) {
                    this.loadingLocalStorage = false;
                } else {
                    this.saveFieldsToLocalStorage();
                }
            },
            deep: true
        }
    }
});

var vm = new Vue({
    el: '#app',
    created() {
        this.$on('event_parent', function(id) {
            console.log('Event from parent component emitted', id);
        });
    },
    data: function() {
        return {
            msg: 'hello vue',
            id: ''
        };
    },
    methods: {
        eventChild: function(id) {
            console.log('Event from child component emitted', id);
        },
        eventParent: function() {
            this.$emit('event_parent', 1);
        }
    }
});

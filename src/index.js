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

Vue.component('i-lock', {
    template: `
    <svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-10 0v-4c0-2.206 1.794-4 4-4s4 1.794 4 4v4h-8z"/>
    </svg>
    `
});
Vue.component('i-text', {
    template: `
    <svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M24 20v1h-4v-1h.835c.258 0 .405-.178.321-.422l-.473-1.371h-2.231l-.575-1.59h2.295l-1.362-4.077-1.154 3.451-.879-2.498.921-2.493h2.222l3.033 8.516c.111.315.244.484.578.484h.469zm-6-1h1v2h-7v-2h.532c.459 0 .782-.453.633-.887l-.816-2.113h-6.232l-.815 2.113c-.149.434.174.887.633.887h1.065v2h-7v-2h.43c.593 0 1.123-.375 1.32-.935l5.507-15.065h3.952l5.507 15.065c.197.56.69.935 1.284.935zm-10.886-6h4.238l-2.259-6.199-1.979 6.199z"/>
    </svg>
    `
});

Vue.component('i-what', {
    template: `
        <i-lock v-if="!!psw"></i-lock>
        <i-text v-else></i-text>
    `,
    props: ['psw']
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

Vue.component('data-forms', {
    template: '#data-forms',
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
            return cnt.reduce((acc, _, i) => acc += `${!i?'':' + '}${_.password?'\uD83D\uDD12':''}'${_.value}'`, '');
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

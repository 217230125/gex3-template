const { createApp, reactive, onMounted, toRefs } = Vue;

// Externalized fetch utility
const loadJsonData = (url, onSuccess, onFail) => {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Bad response');
      return res.json();
    })
    .then(data => onSuccess(data))
    .catch(err => onFail(err));
};

const v10App = {
  setup() {
    // Group all user inputs in one reactive object
    const state = reactive({
      fName: '',
      bDate: '',
      gType: '',
      vAll: '',
      vKids: '',
      stayOpt: '',
      payName: '',
      payNum: '',
      payExp: '',
      paySec: '',
      chosenList: [] // array of IDs
    });

    // Group UI states in another reactive object
    const ui = reactive({
      apiData: [],
      isFetching: false,
      netError: '',
      validation: {},
      finalWarn: '',
      flagShow: false,
      stays: [
        'No accommodation needed',
        'Forest View Hotel',
        'Totoro Family Inn',
        'Witch Valley Guesthouse',
        'Luxury Ghibli Resort'
      ]
    });

    onMounted(() => {
      ui.isFetching = true;
      loadJsonData(
        'ghibli_park.json',
        (d) => {
          ui.apiData = d;
          ui.isFetching = false;
        },
        (e) => {
          ui.netError = 'Failed to load places. Please try again later.';
          ui.isFetching = false;
        }
      );
    });

    const handleCardClick = (targetId) => {
      const pos = state.chosenList.indexOf(targetId);
      if (pos === -1) {
        state.chosenList.push(targetId);
      } else {
        state.chosenList.splice(pos, 1);
      }
    };

    const resolveName = (id) => {
      for (let i = 0; i < ui.apiData.length; i++) {
        if (ui.apiData[i].id === id) return ui.apiData[i].name;
      }
      return '';
    };

    const doValidation = () => {
      let okay = true;
      const v = {};

      if (state.fName.trim() === '') { v.fName = 'Full name is required.'; okay = false; }
      if (state.bDate === '') { v.bDate = 'Date of birth is required.'; okay = false; }
      if (state.gType === '') { v.gType = 'Gender is required.'; okay = false; }

      if (state.chosenList.length === 0) {
        v.places = 'Please select at least one Ghibli Park place.';
        okay = false;
      }

      if (state.vAll === '' || state.vAll < 1) {
        v.vAll = 'Total visitors must be at least 1.';
        okay = false;
      }
      if (state.vKids === '' || state.vKids < 0) {
        v.vKids = 'Number of children cannot be negative.';
        okay = false;
      }
      if (Number(state.vKids) > Number(state.vAll)) {
        v.vKids = 'Children cannot exceed total visitors.';
        okay = false;
      }

      if (state.stayOpt === '') { v.stayOpt = 'Accommodation selection is required.'; okay = false; }
      if (state.payName.trim() === '') { v.payName = 'Name on card is required.'; okay = false; }
      if (state.payNum.trim() === '') { v.payNum = 'Card number is required.'; okay = false; }
      if (state.payExp === '') { v.payExp = 'Expiration date is required.'; okay = false; }
      if (state.paySec.trim() === '') { v.paySec = 'CVC is required.'; okay = false; }

      ui.validation = v;
      return okay;
    };

    const runGenerator = () => {
      ui.validation = {};
      ui.finalWarn = '';
      ui.flagShow = false;

      const isValid = doValidation();

      if (!isValid) {
        ui.finalWarn = 'There are mandatory items pending to be filled. Please complete the required fields.';
      } else {
        ui.flagShow = true;
        setTimeout(() => window.scrollBy({ top: 1000, behavior: 'smooth' }), 200);
      }
    };

    return {
      state,
      ...toRefs(ui),
      handleCardClick,
      resolveName,
      runGenerator
    };
  }
};

createApp(v10App).mount('#vue-root-container');
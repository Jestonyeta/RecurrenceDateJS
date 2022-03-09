class RCD {
   vp = {
      freqs_m:['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'],
      freqs:['w','m','y','1wm','2wm','3wm','4wm'],
      weekdays:{
         su:0,
         mo:1,
         tu:2,
         we:3,
         th:4,
         fr:5,
         sa:6
      },
      dayname:['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
   };
   constructor(ops = false) {
      if(ops === 'getops'){
         return this;
      }
      if(!ops || typeof ops != 'object') {
         return this.error('Options is required');
      }
      this.vp.freqs.push(...this.vp.freqs_m);
      this.datas = {};
      this.i = {};
      this.o = ops;
      if(!this.o.weekdays){
         this.o.weekdays = [];
      }
      this.o.init_start = 0;
      this.o.init_start_cc = 0;
      this.o.readyState = false;
      this.o.init_end = 1;
      if(this.o.jqeury){
         this.o.init_end++;
         this.o.has_jquery = true;
      }
      if(!ops.el) {
         this.o.el = false;
      }
      if(!this.o.df) {
         this.o.df = 'dd/mm/yy';
      }
      if(!this.o.valid_year_range){
         this.o.valid_year_range = [1950,2050];
      }
      this.run_buff = setInterval(() => this.init(), 500);
      return this;
   }
   print_debug(e,a){
      if(this._id('debug_df')) {
         this._id('debug_df').parentNode.removeChild(this._id('debug_df'));
      }
      let debug_box = this._cre('div');
      debug_box.id = 'debug_df';
      let res = a;
      for(let i in res) {
         let nn = this._cre('div');
         nn.innerHTML = res[i];
         debug_box.appendChild(nn);
      }
      e.appendChild(debug_box);
   }
   val_ops() {
      this.el = document.querySelectorAll(this.o.el);
      if(!this.el.length) {
         console.log('Missing node identifier');
         return false;
      }
      this.form = this.el[0];
      if(this.form.nodeName !== 'FORM') {
         console.log('Node expected form tag');
         return false;
      }
      this.val_els();
   }
   val_els() {
      if(!this.form.interval) {
         console.log('Interval field is missing');
         return false;
      }
      this.i.interval = this.form.interval;
      if(!this.form.frequency) {
         console.log('Interval field is missing');
         return false;
      }
      this.i.freq = this.form.frequency;
      this.i.wds = {};
      let wds = this.form['week_days[]'];
      for(let i = 0; i < wds.length; i++) {
         this.i.wds[i] = wds[i];
      }
      if(!wds.length) {
         console.log('weekdays field is missing');
         return false;
      }
      if(!this.form.recurring_from) {
         console.log('datefrom field is missing');
         return false;
      }
      this.i.from = this.form.recurring_from;
      if(!this.form.recurring_to) {
         console.log('dateend field is missing');
         return false;
      }
      this.i.end = this.form.recurring_to;
      if(this.o.has_jquery && typeof $.datepicker === 'object') {
         this.init_dp(this.i.from);
         this.init_dp(this.i.end);
      }
      this.form.addEventListener('submit', (e) => {
         this.out();
         e.preventDefault();
         return false;
      });
   }
   out() {
      this.datas = {};
      this.validate();
      this.calc();
      (this.submit && typeof this.submit === 'function' ? this.submit(this.datas) : this.def_submit());
   }
   init_add() {
      this.o.init_start++;
   }
   init() {
      if(!this.o.el){
         clearInterval(this.run_buff);
         //this.log('DF loaded');
         return true;
      }
      if(!this.o.readyState && document.readyState == 'complete') {
         this.o.readyState = true;
         this.init_add();
      }
      if(this.o.jqeury && typeof $ === 'function') {
         this.init_add();
         this.o.jqeury = false;
      }
      if(this.o.init_start >= this.o.init_end) {
         clearInterval(this.run_buff);
         this.val_ops();
         //this.log('DF loaded');
         return true;
      }
      if(this.o.init_start_cc >= 10) {
         clearInterval(this.run_buff);
         this.log('tried to run but its not fully loaded');;
         return false;
      }
      this.o.init_start_cc++;
   }
   init_dp(a) {
      $(a).datepicker({
         dateFormat: this.o.df
      });
   }
   vd(d, tt = false) {
      if(this.o.df === 'dd/mm/yy') {
         let pd = d.split('/');
         if(pd.length < 3) {
            return false;
         }
         let ed = new Date(pd[2], parseInt(pd[1]) - 1, pd[0]);
         if(ed.getFullYear() > this.o.valid_year_range[1] || ed.getFullYear() < this.o.valid_year_range[0]) {
            return false;
         }
         if(!ed.getTime()){
            return false;
         }
         if(tt) {
            return ed.getTime();
         }
         return ed;
      }
      return false;
   }
   validate() {
      if(!parseInt(this.i.interval.value)) {
         this.datas.error = 'Interval field is required';
         return false;
      }
      if(!this.i.freq.value) {
         this.datas.error = 'Frequency field is required';
         return false;
      }

      let ds = [];
      let wds = this.i.wds;
      for(let i in wds) {
         if(typeof wds[i] === 'object' && wds[i].nodeName && wds[i].nodeName === 'INPUT') {
            if(wds[i].checked) {
               ds.push(parseInt(wds[i].value));
            }
         }
      }
      if(!ds.length) {
         this.datas.error = "No dayas selected";
         return false;
      }
      this.i.ds = ds;

      let from = this.i.from.value;
      let end = this.i.end.value;
      if(!this.vd(from)) {
         this.datas.error = 'FromDate Invalid';
         return false;
      }
      if(!this.vd(end)) {
         this.datas.error = 'EndDate Invalid';
         return false;
      }
      if(this.vd(end, true) < this.vd(from, true)) {
         this.datas.error = 'Invalid Dates: FromDate > EndDate';
         return false;
      }
      if(this.vd(end, true) === this.vd(from, true)) {
         //this.datas.error = 'Please select diffrent date atleast 1 day interval';
         //return false;
      }
   }
   calc() {
      if(this.datas.error) {
         return false;
      }
      this.datas.all_dates = [];
      this.datas.all_weeks = {};
      let from = this.vd(this.i.from.value);
      let end = this.vd(this.i.end.value);
      let cw = 0;
      while(from <= end) {
         if(!this.datas.all_weeks[cw]) {
            this.datas.all_weeks[cw] = [];
         }
         this.datas.all_weeks[cw].push(from);
         this.datas.all_dates.push(from);
         from = new Date(from);
         let cd = from.getDay();
         if(!cd) {
            cw++;
         }
         from.setDate(from.getDate() + 1);
      }
      let interval = parseInt(this.i.interval.value);
      this.datas.days = [];
      this.datas.results = [];
      for(let i = 0; i <= cw; i = i + interval) {
         if(typeof this.datas.all_weeks[i] === 'object') {
            for(let d in this.datas.all_weeks[i]) {
               this.datas.days.push(this.datas.all_weeks[i][d]);
               let ndd = new Date(this.datas.all_weeks[i][d]);
               if(this.i.ds.includes(ndd.getDay())) {
                  let formatted = this.res_format(ndd);
                  this.datas.results.push(formatted);
               }
            }
         }
      }
      if(this.o.debug) {
         if(this._id('debug_df')) {
            this._id('debug_df').parentNode.removeChild(this._id('debug_df'));
         }
         let debug_box = this._cre('div');
         debug_box.id = 'debug_df';
         let res = this.datas.results;
         for(let i in res) {
            let nn = this._cre('div');
            nn.innerHTML = res[i];
            debug_box.appendChild(nn);
         }
         this.form.appendChild(debug_box);
         //console.clear();
         console.log(this.datas);
      }
   }
   _cre(e) {
      return document.createElement(e);
   }
   _id(e) {
      return document.getElementById(e);
   }
   res_format(d) {
      if(this.o.df === 'dd/mm/yy') {
         let m = (d.getMonth() + 1);

         return (d.getDate().toString().length < 2 ? '0' + d.getDate() : d.getDate()) + '/' +
            (m.toString().length < 2 ? '0' + m : m) + '/' + d.getFullYear();
      }
      return d;
   }
   log(a){
      console.log(a);
   }
   error(a){
      this.datas.error = a;
      if(this.o.debug){
         this.log(a);
      }
      return false;
   }
   def_submit() {
      console.log(this.datas);
   }
   c_params(){
      if(this.datas.error){
         return false;
      }
      if(!this.o.interval||isNaN(this.o.interval)){
         return this.error('Invalid interval option');
      }
      if(!this.o.start_date||!this.vd(this.o.start_date)){
         return this.error('Invalid start date');
      }
      if(!this.o.end_date||!this.vd(this.o.end_date)){
         return this.error('Invalid end date');
      }
      if(!this.o.freq||!this.vp.freqs.includes(this.o.freq)){
         return this.error('Invalid frequency "'+this.o.freq+'", valid: '+this.vp.freqs.join(', '));
      }
      if(!this.o.weekdays||!Array.isArray(this.o.weekdays)){
         return this.error('Invalid weekdays option, valid ["'+Object.keys(this.vp.weekdays).toString().split(',').join('","')+'"]');
      }
      this.o.weekdays.every(a=>{
         if(this.vp.weekdays[a]===undefined){
            return this.error('Invalid weekdays option "'+a+'", valid ["'+Object.keys(this.vp.weekdays).toString().split(',').join('","')+'"]');
         }
         return true;
      });
   }
   valid_date(d){
      if(d instanceof Date){
         if(d.getFullYear() > this.o.valid_year_range[0] && d.getFullYear() < this.o.valid_year_range[1] && d.getTime()){
            return d;
         }
      }
      return false;
   }
   defreq(d){
      if(d instanceof Date){
         if(d.getTime()){
            return d.getFullYear()+','+d.getMonth()+','+d.getDate();
         }
      }else if(typeof d === 'string'&&d.indexOf(',') > -1){
         let dd = d.split(',');
         let cd = new Date(dd[0],dd[1],dd[2]);
         return this.valid_date(cd);
      }
      return false;
   }
   c_alldays(){
      if(this.datas.error){
         return false;
      }
      this.datas.all_dates = [];
      let from = this.vd(this.o.start_date);
      let end = this.vd(this.o.end_date);
      while(from <= end) {
         if(from.getTime()&&this.defreq(from)){
            this.datas.all_dates.push(this.defreq(from));
         }
         from = new Date(from);
         from.setDate(from.getDate() + 1);
      }
   }
   oblen(o){
      if(typeof o != 'object'){
         return 0;
      }
      return Object.keys(o).length;
   }
   days_need(){
      let needs = [];
      this.o.weekdays.every(a=>{
         if(this.vp.weekdays[a]!=undefined){
            needs.push(this.vp.weekdays[a]);
         }
         return true;
      });
      if(!needs.length){
         for(let i in this.vp.weekdays){
            needs.push(this.vp.weekdays[i]);
         }
      }
      return needs;
   }
   c_calc(pfreq){
      if(this.datas.error){
         return false;
      }
      this.datas.freq_dates = {};
      switch(pfreq){
         case 'w':
            let weeks = {};
            let cw = 0;
            this.datas.all_dates.forEach(dd=>{
               if(this.defreq(dd)){
                  let d = this.defreq(dd);
                  if(!weeks[cw]){
                     weeks[cw] = [];
                  }
                  weeks[cw].push(d);
                  if(!d.getDay()){
                     cw++;
                  }
               }
            });
            this.datas.freq_dates = weeks;
         break;
         case 'm':
            let months = {};
            let cm = 0;
            this.datas.all_dates.forEach(dd=>{
               if(this.defreq(dd)){
                  let d = this.defreq(dd);
                  if(!months[cm]){
                     months[cm] = [];
                  }
                  months[cm].push(d);
                  let gld = new Date(d.getFullYear(),(d.getMonth()+1),0);
                  if(gld.getDate()===d.getDate()){
                     cm++;
                  }
               }
            });
            this.datas.freq_dates = months;
         break;
         case 'y':
            let years = {};
            let cy = 0;
            this.datas.all_dates.forEach(dd=>{
               if(this.defreq(dd)){
                  let d = this.defreq(dd);
                  if(!years[cy]){
                     years[cy] = [];
                  }
                  years[cy].push(d);
                  let gld = new Date(d.getFullYear(),(d.getMonth()+1),0);
                  if(gld.getDate()===d.getDate()&&gld.getMonth()===11){
                     cy++;
                  }
               }
            });
            this.datas.freq_dates = years;
         break;
         case '1wm':
            let fwm = {};
            let cc = 0;
            this.datas.all_dates.forEach(dd=>{
               if(this.defreq(dd)){
                  let d = this.defreq(dd);
                  if(!fwm[cc]){
                     fwm[cc] = [];
                  }
                  let gld = new Date(d.getFullYear(),(d.getMonth()+1),0);
                  if(d.getDate()<=7){
                     fwm[cc].push(d);
                  }else if(gld.getDate()===d.getDate()){
                     cc++;
                  }
               }
            });
            this.datas.freq_dates = fwm;
         break;
         case '2wm':
            let wm_2 = {};
            let cc_wm_2 = 0;
            this.datas.all_dates.forEach(dd=>{
               if(this.defreq(dd)){
                  let d = this.defreq(dd);
                  if(!wm_2[cc_wm_2]){
                     wm_2[cc_wm_2] = [];
                  }
                  let gld = new Date(d.getFullYear(),(d.getMonth()+1),0);
                  if(d.getDate()>7&&d.getDate()<=14){
                     wm_2[cc_wm_2].push(d);
                  }else if(gld.getDate()===d.getDate()){
                     cc_wm_2++;
                  }
               }
            });
            this.datas.freq_dates = wm_2;
         break;
         case '3wm':
            let wm_3 = {};
            let cc_wm_3 = 0;
            this.datas.all_dates.forEach(dd=>{
               if(this.defreq(dd)){
                  let d = this.defreq(dd);
                  if(!wm_3[cc_wm_3]){
                     wm_3[cc_wm_3] = [];
                  }
                  let gld = new Date(d.getFullYear(),(d.getMonth()+1),0);
                  if(d.getDate()>14&&d.getDate()<=21){
                     wm_3[cc_wm_3].push(d);
                  }else if(gld.getDate()===d.getDate()){
                     cc_wm_3++;
                  }
               }
            });
            this.datas.freq_dates = wm_3;
         break;
         case '4wm':
            let wm_4 = {};
            let cc_wm_4 = 0;
            this.datas.all_dates.forEach(dd=>{
               if(this.defreq(dd)){
                  let d = this.defreq(dd);
                  if(!wm_4[cc_wm_4]){
                     wm_4[cc_wm_4] = [];
                  }
                  let gld = new Date(d.getFullYear(),(d.getMonth()+1),0);
                  if(d.getDate()>21&&d.getDate()<=(gld.getDate()-1)){
                     wm_4[cc_wm_4].push(d);
                  }else if(gld.getDate()===d.getDate()){
                     wm_4[cc_wm_4].push(d);
                     cc_wm_4++;
                  }
               }
            });
            this.datas.freq_dates = wm_4;
         break;
         default:
            if(this.vp.freqs_m.includes(pfreq)){
               let ymm = {};
               let ymm_cc = 0;
               this.datas.all_dates.forEach(dd=>{
                  if(this.defreq(dd)){
                     let d = this.defreq(dd);
                     if(!ymm[ymm_cc]){
                        ymm[ymm_cc] = [];
                     }
                     if(d.getMonth()===this.vp.freqs_m.indexOf(pfreq)){
                        ymm[ymm_cc].push(d);
                     }
                     if(d.getMonth()===11&&d.getDate()===31){
                        ymm_cc++;
                     }
                  }
               });
               this.datas.freq_dates = ymm;
            }else{
               return this.error('Invalid frequency "'+pfreq+'" valid: ["'+this.vp.freqs.join('","')+'"]');
            }
         break;
      }
      return this.datas;
   }
   c_getDates(){
      if(this.datas.error){
         return false;
      }
      if(!this.datas.freq_dates){
         this.error('Invalid frequency dates');
         return false;
      }
      if(!this.oblen(this.datas.freq_dates)){
         this.error('0 frequency dates');
         return false;
      }
      if(!Array.isArray(this.datas.dates)){
         this.datas.dates = [];
      }
      let fd = this.datas.freq_dates;
      for(let i = 0; i <= this.oblen(fd); i = i + parseInt(this.o.interval)) {
         for(let d in fd[i]) {
            let cd = fd[i][d];
            if(this.days_need().includes(cd.getDay())){
               this.datas.dates.push(this.res_format(cd));
            }
         }
      }
      this.datas.options = this.o;
      if(!this.o.debug){
         delete this.datas.options;
         delete this.datas.freq_dates;
         delete this.datas.all_dates;
      }
   }
   results(){
      this.c_params();
      this.c_alldays();
      this.c_calc(this.o.freq);
      this.c_getDates();
      return this.datas;
   }
}
# RecurrenceDateJS
```
let rcd = new RCD({
   weekdays:['we'], // valid weekdays values ["su","mo","tu","we","th","fr","sa"]
   start_date:'16/01/2022',
   end_date:'16/12/2024',
   freq:'jan', // valid freq values ["w","m","y","1wm","2wm","3wm","4wm","jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
   interval:1
});
let res = rcd.results();
if(res.error){
   console.log(res.error);
}else{
   console.log(res);
   // do something
}
```

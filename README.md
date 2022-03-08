## Usage
```html
<!DOCTYPE HTML>
<html>
  <head>
    <title>RecurrenceDateJS</title>
    <script src="RD.js"></script>
  </head>
  <body>
    <script>
    let rcd = new RCD({
       weekdays:['mo','we','su'],
       start_date:'16/01/2022',
       end_date:'16/12/2024',
       freq:'w',
       interval:1
    });
    let res = rcd.results();
    if(res.error){
       console.log(res.error);
    }else{
       console.log(res.dates);
       // do something
    }
    </script>
  </body>
</html>
```
| Option  | Type | Value | Required |
| ---      | ---       | --- | --- |
| weekdays | Array    | ["su","mo","tu","we","th","fr","sa"] | true | 
| Pipe     | \|        |

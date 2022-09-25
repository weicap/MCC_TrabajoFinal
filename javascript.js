function aquipe(){
    console.log("primero")
    const spawner = require('child_process').spawn;

    // const data_to_pass_in ={
    //     data_sent: 'Send this tu python',
    //     data_returned: undefined
    // }

    // var data_to_pass_in = [[10,12]]
    console.log("primero 2")
    //console.log('data sent to python script', data_to_pass_in);

    const python_process = spawner('python',['./app.py', JSON.stringify('data_to_pass_in')]);

    python_process.stdout.on('data',(datas)=>{
        console.log('data recived: ',JSON.parse(datas.toString()));
        //console.log('data recived: ',JSON.parse(data.toString()));
    //console.log('listo 2')
    arra = JSON.parse(datas)
    console.log(arra[1])
    });
//return arra
}
aquipe();

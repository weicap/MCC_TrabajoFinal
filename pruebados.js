function pruebaw(){
    console.log('d');
    const jsonData= import('./Pca_diabetes.json'); 
    console.log('e');
    console.log(jsonData);
    return(jsonData)
}

function dary(){
    return ('ejemplo')
}
//adi();

// function adi(){
//     const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));

//     const countries = loadJSON('./Pca_diabetes.json');
//     return(countries);
// }

pruebaw()
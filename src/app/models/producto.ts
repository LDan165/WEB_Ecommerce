export class Producto{
    constructor(
        public id: number,
        public nombre: string,
        public precio: number,
        public imagen: string,
        public cantidad = 0,
        public descripcion = "",
    ){}
}


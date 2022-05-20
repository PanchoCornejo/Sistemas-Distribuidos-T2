# Sistemas-Distribuidos
Tarea 2 del Ramo


## Funcionamiento de la APP
Para correr la tarea se requiere contar con Postgrsql, Node, Kafka

Dependencias Utilizadas en mi caso utilize yarn en vez de npm:

`yarn add body-parser cors dotenv express express-session json-server kafkajs pg`

Se requiere correr el docker-compose para eso se ejecuta:

`sudo docker-compose up`

Luego para utilizar la base de datos se requiere conseguir la ip correspondiente a esta para esto uno ejecuta:

`sudo docker ps`

que nos listara las imagenes que estamos corriendo, luego anotamos la id de el servicio de postgres en bitnami y ejecutamos el codigo:

`sudo docker inspect "ID"`

buscamos la IP y la copiamos para luego pegarla en nuestro servidor ubicado en **/securityS/kafka.js**  y **/src/index.js** en  donde debes reemplazar esta ip por la cual se encuentra puesta en host: "IP"

![no carga la imagen](https://cdn.discordapp.com/attachments/878099236334485504/971260279985954826/ip.png)

corremos en la consola de comando que envuelve todo, estos 2 comandos para crear los topicos usados (en realidad solo se necesita 1 pero a veces da error sino esta el segundo):

`sudo docker-compose exec kafka /opt/bitnami/kafka/bin/kafka-topics.sh --create --topic quickstart-events --bootstrap-server localhost:9092`

`sudo docker-compose exec kafka /opt/bitnami/kafka/bin/kafka-topics.sh --create --topic bloqueo --bootstrap-server localhost:9092`

Luego guardamos el codigo y corremos nuestra api de login:

`yarn start:producer`

Lo cual iniciara el servicio de login quien se conecta a la base de datos y envia las solicitudes por kafka como productor, ahora procedemos a correr el consumidor que es nuestra api de **Seguridad**:

`yarn start:consumer`

Y estara listo para recibir peticiones insomnia o postman.

## Realizar Login

Para poder iniciar sesion se requiere entrar a postman o insomnia y enviar por metodo **post** a la `localhost:3000/login` donde ingresaremos un usuario para loguear, cabe destacar se se inicializo una base de datos con unos cuantos usuarios que vienen por defectos todos habilitados para ingresar (osea no tienen la cuenta bloqueada) la lista la puedes encontrar en la carpeta **/db/init.sql**  (Todas las cuentas tienen la misma contraseña "hola123") :

Usuarios:
```
Panchosky
Ignacio
Marion
Profesor
Nicolas
Jaime
Francisco
Martin
Gaspar
```
Un ejemplo de Login:

```
{
    "username": "Marion",
    "password": "hola122"
}
```

Esto equivale a un ingreso erroneo ya que todas las claves de los usuarios de la base de datos son "hola123" y podemos notar que se ingreso con "hola122".

El inicio de secion una vez enviado la anterior sentencia para por la API de logueo la cual primero revisa si esta persona se encunetra bloqueada o no consultandole su estado en la base de datos, si esta bloqueada cancelara su intento de inicio de secion por lo que no seguira de aqui en adelante. Si este usuario no se encuentra bloqueado revisara su contraseña si coincide con la base de datos asi podemos saber que estado de inicio de sesion realizo este usuario, uno Fallido o exitoso.

Una vez el usuario haga su intento de inicio de sesion se mandan los datos por kafka a nuesta API de seguridad, donde los datos se mandan con la siguiente estructura:
```
{
    usuario: "Marion",
    contraseña: "hola122",
    fail: True/False (Depende de si coloca correctamente la contraseña o no)
    hora: 20
    min: 50    (Hora, minuto y segundo exato que realiza su inicio de sesion)
    seg: 20
}
```

La API de seguridad recibe estos datos mediante kafka y revisa si esta persona ya a realizado 5 inicios de sesion fallidos,  si esto ocurre entra en investigacion, si es que estos fueron en un intervalo menor de 1 min (ultimo con el 5veces anterior). Si la API encuentra que el usuario debe ser bloqueado , manda un UPDATE a la base de datos lo cual no le permitira loguear la proxima vez.


**Tomar en cuenta**

-Si no se realizan inicios de sesion erroneos nunca se bloqueara niuna cuenta

-Tratar de enviar los 5 inicios de sesion erroneos  en menos de 1 min.

-Evitar realizar un inicio de sesion a las 59min de alguna hora actual.. :) 



## Consultar por los Usuarios Bloqueados

Para consultar por los usuarios bloqueados se puede realizar mediante la ruta mostrada a continuacion con el metodo GET la cual respondera con una lista de todos los usuarios que han sido bloqueados. **(Notar que es el puerto 3001)**

`localhost:3001/bloqueados`


## Preguntas

1. ¿Por que Kafka funciona bien en este escenario?
Funciona bien en este escenario ya que podemos tener varios intentos de inicio de secion separados y tener un sistema distribuido mayor ya mas escalable, ya que podemos tomar multiples conexiones de parte de nuestros usuarios que se loguean en el sistema y liberar carga ayudandose de un secicio que se encargue de la seguridad. Ya que en otro caso sobrecargariamos todo en un servicio. 
2. Basado en las tecnologıas que usted tiene a su disposicion (Kafka, backend) ¿Que harıa usted para manejar
una gran cantidad de usuarios al mismo tiempo?
Utilizaria Kafka para liberar el peso de un servicio ya que multiples conexiones al mismo instante tendrian sobrecargado este , con esto podemos repartir dependiendo de lo que requiera ser procesado y asi tener bien repartido la carga de procesamiento para que no solo una parte quede cargada y evitar caidas de nuestro sistema y un mayor performance

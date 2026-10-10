// Референс с X (#p5js): код целиком в одном твите. Автор и ссылка: дописать, когда найдём пост.
// Код почти дословный. Единственная правка: noStroke()+background(0) -> noStroke()+background(0):
// в p5 1.9.4 noStroke() возвращает объект p5, и background(...) падает с «not a valid color representation».
f=0;r=190,b=255// Swirl #p5js
draw=_=>{f++||createCanvas(W=2*(w=200),W)+noStroke()+background(0)
f&3?0:background(0,8);dt=.8*sin(t=f/200)
for(u=t;q=sin(u),p=cos(u),u<t+TAU;u+=1-dt)
for(v=t;j=sin(v),k=cos(v),v<t+TAU;v+=1+dt)
{fill(c=b*j,b*p,b-c);circle(w+r*q*k,w+r*q*j,5*q)}}

yarn docker:build \
&& sudo docker tag connect-center-front:latest 45.76.182.76:5000/connect-center-front:latest \
&& sudo docker push 45.76.182.76:5000/connect-center-front:latest

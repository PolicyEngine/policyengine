FROM gcr.io/google-appengine/python

# Create a virtualenv for dependencies. This isolates these packages from
# system-level packages.
# Use -p python3 or -p python3.7 to select python version. Default is version 2.
RUN virtualenv /env -p python3.7

# Setting these environment variables are the same as running
# source /env/bin/activate.
ENV VIRTUAL_ENV /env
ENV PATH /env/bin:$PATH
ENV GOOGLE_APPLICATION_CREDENTIALS .gac.json

# Copy the application's requirements.txt and run pip to install all
# dependencies into the virtualenv.

# Add the application source code.
ADD . /app

RUN cd /app && make server

# Run a WSGI server to serve the application. gunicorn must be declared as
# a dependency in requirements.txt.
CMD gunicorn -b :$PORT policyengine.server:app --timeout 240

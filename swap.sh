sudo fallocate -l 8G /swapfile

ls -lh /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile



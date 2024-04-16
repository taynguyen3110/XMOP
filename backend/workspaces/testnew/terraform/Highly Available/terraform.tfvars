id = "testnew"
username = "wordpressuser"
password = "password"
db_name = "wordpress"
lb_ingress = [
{
  from_port = 80
  to_port = 80
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
},
{
  from_port = 443
  to_port = 443
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}
]
lb_egress = [
{
  from_port = 0
  to_port = 0
  protocol = "-1"
  cidr_blocks = ["0.0.0.0/0"]
}
]
region = "ap-southeast-2"
os_option = "linux"
ami_id = "ami-0df5c32c4d4710802"
instance_type = "t2.micro"
key_name = ""
instance_count = 3
min_instance_count = 3
max_instance_count = 5
storage_type = "gp3"
allocated_storage = 20
engine = "mariadb"
engine_version = "10.11.5"
environment_type = "production"
instance_class = "db.t3.micro"
multi_az = true

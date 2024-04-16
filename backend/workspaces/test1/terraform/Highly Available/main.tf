module "networking" {
  source = "./modules/networking"
  id     = var.id
}

module "security" {
  source = "./modules/security"

  id          = var.id
  vpc_id      = module.networking.vpc_id

  lb_ingress = var.lb_ingress
  lb_egress  = var.lb_egress
}

module "instances" {
  source = "./modules/instances"

  id     = var.id
  vpc_id = module.networking.vpc_id
  region = var.region

  #Bastion
  bastion_subnet         = module.networking.public_subnet_1_id
  bastion_security_group = module.security.bastion_sg_id

  #EFS
  efs_sg_id = module.security.efs_sg_id

  #RDS Database
  environment_type  = var.environment_type
  rds_sg_id         = module.security.rds_sg_id
  engine            = var.engine
  engine_version    = var.engine_version
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  username          = var.username
  password          = var.password
  storage_type      = var.storage_type
  multi_az          = var.multi_az
  db_name           = var.db_name
  private_subnet_ids = [
    module.networking.private_subnet_1_id,
    module.networking.private_subnet_2_id,
    module.networking.private_subnet_3_id
  ]

  #Wordpress Instances
  instance_count     = var.instance_count
  os_option          = var.os_option
  min_instance_count = var.min_instance_count
  max_instance_count = var.max_instance_count
  instance_type      = var.instance_type
  ami_id             = var.ami_id
  key_name           = var.key_name
  security_group_id  = module.security.ec2_sg_id
  ec2_subnet_ids = [
    module.networking.private_subnet_1_id,
    module.networking.private_subnet_2_id
  ]

  #Load Balancer
  lb_subnet_ids = [
    module.networking.public_subnet_1_id,
    module.networking.public_subnet_2_id
  ]
  lb_security_group_id = module.security.lb_sg_id
}

# terraform {
#     backend "local" {
#     }
# }

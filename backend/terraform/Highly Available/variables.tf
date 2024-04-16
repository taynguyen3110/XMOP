variable "region" {
  description = "The AWS region where resources will be provisioned."
  type        = string
}

variable "instance_type" {
  description = "The type of EC2 instance to launch."
  type        = string
}

variable "ami_id" {
  description = "The ID of the Amazon Machine Image (AMI) to use for the EC2 instance."
  type        = string
}

variable "os_option" {
}

variable "key_name" {
  description = "The name of the key pair to use for SSH access."
  type        = string
}

variable "instance_count" {
  description = "The desired number of EC2 instances to launch."
  type        = number
}

variable "min_instance_count" {
  description = "The minimum number of EC2 instances allowed in the Auto Scaling Group."
  type        = number
}

variable "max_instance_count" {
  description = "The maximum number of EC2 instances allowed in the Auto Scaling Group."
  type        = number
}

variable "lb_ingress" {
  description = "Inbound rules for Load Balancer SG."
  default     = []
  type        = any
}

variable "lb_egress" {
  description = "Outbound rules for Load Balancer SG."
  default     = []
  type        = any
}

variable "engine" {
  default = "mysql"
}

variable "engine_version" {
  default = "8.0.35"
}

variable "instance_class" {
  default = "db.t2.micro"
}

variable "allocated_storage" {
  default = 5
}

variable "username" {
  default = "wordpressuser"
}

variable "password" {
  default = "password"
}

variable "storage_type" {
  default = "gp2"
}

variable "multi_az" {
  default = false
}

variable "db_name" {
  default = "wordpress"
}

variable "environment_type" {
  type = string
}

variable "id" {
  type = string
}

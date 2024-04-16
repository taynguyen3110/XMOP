output "lb_url" {
  value = aws_lb.wordpress_lb.dns_name
}